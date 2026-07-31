<?php

namespace App\Services;

use App\Models\RefreshToken;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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
     * @param  User  $user  The user for whom to generate tokens.
     * @param  CarbonInterface|null  $sessionStartedAt  When the rotation chain originally began.
     *                                                  Pass the rotated token's value on refresh;
     *                                                  omit on login to start a new session.
     * @return array{
     *     access_token: string,
     *     refresh_token: string,
     *     access_expires_in: int,
     *     refresh_expires_in: int
     * }
     */
    public function generateToken(User $user, ?CarbonInterface $sessionStartedAt = null): array
    {

        return DB::transaction(function () use ($user, $sessionStartedAt) {

            $accessToken = $user->createToken('auth_token', ['*'], now()->addMinutes($this->accessTokenExpirationInMinutes))->plainTextToken;

            $refreshToken = Str::random(64);

            $this->createRefreshToken($user, $refreshToken, $sessionStartedAt);

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
     * @param  User  $user  The user associated with the refresh token.
     * @param  string  $token  The plain-text refresh token.
     * @param  CarbonInterface|null  $sessionStartedAt  Origin of the rotation chain; defaults to
     *                                                  now, which begins a new session.
     * @return void
     */
    protected function createRefreshToken(User $user, string $token, ?CarbonInterface $sessionStartedAt = null): void
    {
        RefreshToken::create([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addMinutes($this->refreshTokenExpirationInMinutes),
            'session_started_at' => $sessionStartedAt ?? now(),
        ]);
    }
}
