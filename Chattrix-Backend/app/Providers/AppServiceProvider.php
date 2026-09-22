<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // The verification mail is sent by AuthService::register instead of by Laravel's
        // Registered listener, which takes no arguments and so cannot carry the invite's `next`.
    }
}
