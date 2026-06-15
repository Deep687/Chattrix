<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\RefreshToken;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * Service class for handling core authentication logic.
 */
class AuthService
{
    /**
     * Create a new class instance.
     */
    public function __construct() {}

    /**
     * Create a new user record in the database.
     *
     * @param array $validatedData The validated data from the registration request.
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

    /*
 * Attempt to authenticate a user.
 *
 * @param array{
 *
 *     email: string,
 *     password: string
 * } $validatedData
 *
 * @throws AuthenticationException
 */
    public function AttemptLogin(array $validatedData): ?User
    {
        if (!Auth::attempt($validatedData)) {
            return null;
        }

        $user = Auth::user();

        return $user;
    }

    /**
     * Log out a user by deleting their access and refresh tokens.
     *
     * @param string $bearerToken The user's current access token.
     * @return void
     */
    public function AttemptLogout(string $bearerToken): void
    {
        if (!$bearerToken) {
            return;
        }

        $accessToken = PersonalAccessToken::findToken($bearerToken);

        if (! $accessToken) {
            return;
        }

        RefreshToken::where('user_id', $accessToken->tokenable_id)->delete();

        $accessToken->delete();
    }

    /**
     * Invalidate old tokens after a successful token refresh.
     *
     * @param \Illuminate\Http\Request $request The request, expected to contain the user and the RefreshToken model.
     * @return void
     */
    public function invalidateTokensAfterRefresh(\Illuminate\Http\Request $request): void
    {
        $user = $request->user();

        // 1. Delete all previous access tokens for the user.
        // This is a security measure to prevent old, potentially compromised
        // access tokens from being used.
        $user->tokens()->delete();

        // 2. Delete the specific refresh token that was used for this request.
        // We expect the middleware to have attached the RefreshToken model to the request.
        // This implements refresh token rotation.
        if ($request->refreshTokenModel instanceof RefreshToken) {
            $request->refreshTokenModel->delete();
        }
    }
}
