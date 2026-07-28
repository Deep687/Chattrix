<?php

namespace App\Services;

use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * Service class for handling core authentication logic.
 */
class AuthService
{
    /**
     * Create a new user record in the database.
     *
     * @param  array  $validatedData  The validated data from the registration request.
     * @return User The newly created user.
     */
    public function register(array $validatedData): User
    {
        return User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
        ]);
    }

    /**
     * Attempt to authenticate a user.
     *
     * @param  array{
     *     email: string,
     *     password: string
     * }  $validatedData
     * @return User|null The authenticated user, or null when the credentials are invalid.
     */
    public function attemptLogin(array $validatedData): ?User
    {
        if (! Auth::attempt($validatedData)) {
            return null;
        }

        $user = Auth::user();

        return $user;
    }

    /**
     * Log out a user by deleting their access and refresh tokens.
     *
     * @param  string|null  $bearerToken  The user's current access token.
     */
    public function attemptLogout(?string $bearerToken): void
    {
        if (! $bearerToken) {
            return;
        }

        $accessToken = PersonalAccessToken::findToken($bearerToken);

        if (! $accessToken) {
            return;
        }

        DB::transaction(function () use ($accessToken) {
            RefreshToken::where('user_id', $accessToken->tokenable_id)
                ->whereNull('revoked_at')
                ->update([
                    'revoked_at' => now(),
                ]);

            $accessToken->delete();
        });
    }

    /**
     * Invalidate old tokens after a successful token refresh.
     *
     * The middleware validates the refresh token outside of any transaction, so the row is
     * re-read here under a lock and re-checked. Without this, two concurrent requests carrying
     * the same refresh token both pass the middleware and both mint a new token pair.
     *
     * A chain that has outlived the absolute session lifetime is refused here too, so an
     * indefinitely active session still has to re-authenticate eventually.
     *
     * @param  Request  $request  The request, expected to contain the user and the RefreshToken model.
     * @return RefreshToken|null The rotated token, or null when it was already revoked or expired
     *                           by a competing request, or the session has aged out.
     */
    public function invalidateTokensAfterRefresh(Request $request): ?RefreshToken
    {
        return DB::transaction(function () use ($request) {

            $attachedToken = $request->attributes->get('refresh_token');

            if (! $attachedToken instanceof RefreshToken) {
                return null;
            }

            $refreshToken = RefreshToken::whereKey($attachedToken->getKey())
                ->lockForUpdate()
                ->first();

            if (! $refreshToken || $refreshToken->revoked_at || $refreshToken->expires_at->isPast()) {
                return null;
            }

            // An aged-out chain is still torn down below; it simply may not be rotated.
            $sessionHasAgedOut = $refreshToken->hasReachedAbsoluteLifetime();

            // Rotate the refresh token that was used for this request.
            $refreshToken->update([
                'revoked_at' => now(),
            ]);

            // Delete all previous access tokens for the user. This is a security measure to
            // prevent old, potentially compromised access tokens from being used.
            $request->user()->tokens()->delete();

            return $sessionHasAgedOut ? null : $refreshToken;
        });
    }
}
