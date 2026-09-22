<?php

namespace App\Http\Middleware;

use App\Models\RefreshToken;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SanctumRefresh
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {

        $refreshToken = $request->header('X-Refresh-Token');

        if (! $refreshToken) {
            return response()->json([
                'message' => 'token is required',
            ], 401);
        }

        $hashToken = hash('sha256', $refreshToken);

        $token = RefreshToken::where('token_hash', $hashToken)->first();

        if (! $token) {
            return response()->json([
                'message' => 'token not found',
            ], 401);
        }

        if ($token->revoked_at) {
            return response()->json([
                'message' => 'token already revoked',
            ], 401);
        }

        if ($token->expires_at->isPast()) {
            $token->delete();

            return response()->json([
                'message' => 'token is expired',
            ], 401);
        }

        $user = $token->user;

        if (! $user) {
            return response()->json([
                'message' => 'user not found',
            ], 401);
        }

        Auth::setUser($user);

        $request->attributes->set('refresh_token', $token);

        return $next($request);
    }
}
