<?php

namespace App\Providers;

use App\Services\Ai\ChatProvider;
use App\Services\Ai\EmbeddingProvider;
use App\Services\Ai\GeminiClient;
use App\Services\ChunkingService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // One client serves both interfaces; swapping providers is a change here, not in callers.
        $this->app->singleton(GeminiClient::class, fn () => new GeminiClient(config('services.gemini')));
        $this->app->bind(EmbeddingProvider::class, GeminiClient::class);
        $this->app->bind(ChatProvider::class, GeminiClient::class);

        $this->app->bind(ChunkingService::class, fn () => new ChunkingService(
            config('rag.chunk_size'),
            config('rag.chunk_overlap'),
        ));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // The verification mail is sent by AuthService::register instead of by Laravel's
        // Registered listener, which takes no arguments and so cannot carry the invite's `next`.

        $this->configureRateLimiting();
    }

    /**
     * Named limiters for the auth and invite routes.
     *
     * A bare `throttle:6,1` keys guests by IP alone, shared across every route using it, so one
     * office behind NAT would lock out its own employees. Each limiter below keys on the thing
     * being attempted (email, token, user) and keeps a looser per-IP ceiling against spraying.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('auth', fn (Request $request) => [
            Limit::perMinute(6)->by('auth:'.Str::lower((string) $request->input('email')).'|'.$request->ip()),
            Limit::perMinute(60)->by('auth-ip:'.$request->ip()),
        ]);

        RateLimiter::for('verify-email', fn (Request $request) => [
            Limit::perMinute(6)->by('verify:'.$request->route('id').'|'.$request->ip()),
            Limit::perMinute(60)->by('verify-ip:'.$request->ip()),
        ]);

        RateLimiter::for('verify-resend', fn (Request $request) => Limit::perMinute(6)->by('resend:'.$request->user()?->id));

        RateLimiter::for('session-token', fn (Request $request) => [
            Limit::perMinute(6)->by('token:'.hash('sha256', (string) ($request->header('X-Refresh-Token') ?? $request->bearerToken()))),
            Limit::perMinute(60)->by('token-ip:'.$request->ip()),
        ]);

        // Each question costs model quota, so it is metered per user, not per IP.
        RateLimiter::for('ask', fn (Request $request) => Limit::perMinute(10)->by('ask:'.$request->user()?->id));

        RateLimiter::for('uploads', fn (Request $request) => Limit::perMinute(10)->by('upload:'.$request->user()?->id));

        RateLimiter::for('invitations', fn (Request $request) => [
            Limit::perMinute(10)->by('invite:'.hash('sha256', (string) $request->route('token')).'|'.$request->ip()),
            Limit::perMinute(60)->by('invite-ip:'.$request->ip()),
        ]);
    }
}
