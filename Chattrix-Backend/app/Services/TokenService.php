<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Str;
use App\Models\RefreshToken;
use Illuminate\Support\Facades\DB;

/**
 * Service class for handling the generation of access and refresh tokens.
 */
class TokenService
{
    /**
     * The expiration time for access tokens in minutes.
     *
     * @var int
     */
    private int $accessTokenExpirationInMinutes;
    /**
     * The expiration time for refresh tokens in minutes.
     *
     * @var int
     */
    private int $refreshTokenExpirationInMinutes;

    /**
     * Create a new TokenService instance.
     * Initializes token expiration settings from the configuration.
     */
    public function __construct()
    {
        $this->accessTokenExpirationInMinutes = (int) config('sanctum.expiration');
        $this->refreshTokenExpirationInMinutes = (int) config('auth_tokens.refresh_token_expiration_in_minutes');
    }

    /**
     * Generate new access and refresh tokens for a user.
     *
     * @param User $user The user for whom to generate tokens.
     * @return array{
     *     access_token: string,
     *     refresh_token: string,
     *     access_expires_in: int,
     *     refresh_expires_in: int
     * }
     */
    public function generateToken(User $user): array
    {

        return DB::transaction(function () use ($user) {

        // Delete all existing access tokens
        $user->tokens()->delete();

        RefreshToken::where('user_id',$user->id)->delete();

        $accessToken = $user->createToken('auth_token', ['*'], now()->addMinutes($this->accessTokenExpirationInMinutes))->plainTextToken;

        $refreshToken = Str::random(64);

        $this->createRefreshToken($user, $refreshToken);


        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'access_expires_in' => $this->accessTokenExpirationInMinutes * 60,
            'refresh_expires_in' => $this->refreshTokenExpirationInMinutes * 60,
        ];
         });
    }

    /**
     * Create and store a new refresh token for the user.
     *
     * @param User $user The user associated with the refresh token.
     * @param string $token The plain-text refresh token.
     * @return void
     */
    protected function createRefreshToken(User $user, string $token): void
    {
        RefreshToken::create([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addMinutes($this->refreshTokenExpirationInMinutes)
        ]);
    }
}
