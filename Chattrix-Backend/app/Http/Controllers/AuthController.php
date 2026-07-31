<?php

namespace App\Http\Controllers;

use App\Actions\User\UpdateProfileAction;
use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\LoginUserRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use App\Services\TokenService;
use App\Traits\ApiResponser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Handles authentication-related requests like registration, login, logout, and token refreshing.
 */
class AuthController extends Controller
{
    use ApiResponser;

    /**
     * @param  AuthService  $authService
     * @param  TokenService  $tokenService
     * @param  UpdateProfileAction  $updateProfileAction
     */
    public function __construct(
        private AuthService $authService,
        private TokenService $tokenService,
        private UpdateProfileAction $updateProfileAction
    ) {}

    /**
     * Register a new user.
     *
     * @param  CreateUserRequest  $request
     * @return JsonResponse
     */
    public function register(CreateUserRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        $user = $this->authService->register($validatedData);

        return $this->success([
            'user' => new UserResource($user),
        ], 201, 'User registered successfully');
    }

    /**
     * Authenticate a user and return tokens.
     *
     * @param  LoginUserRequest  $request
     * @return JsonResponse
     */
    public function login(LoginUserRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        $user = $this->authService->attemptLogin($validatedData);

        if (! $user) {
            return $this->error(null, 401, 'Invalid credentials');
        }

        $tokens = $this->tokenService->generateToken($user);

        return $this->success([
            'user' => new UserResource($user),
            ...$tokens,
        ], 200, 'User logged in successfully');
    }

    /**
     * Log out the authenticated user by invalidating their tokens.
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {

        $this->authService->attemptLogout($request->bearerToken());

        return $this->success(null, 200, 'Logged out successfully');
    }

    /**
     * Refresh the authentication tokens for the currently authenticated user.
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function refresh(Request $request): JsonResponse
    {
        // The `SanctumRefresh` middleware has already resolved and authenticated the user, and
        // returns a 401 itself when the refresh token is missing, unknown, revoked or expired.
        $rotatedToken = $this->authService->invalidateTokensAfterRefresh($request);

        if (! $rotatedToken) {
            return $this->error(null, 401, 'Refresh token is no longer valid');
        }

        // Carry the rotated token's chain origin forward so the absolute session lifetime keeps
        // being measured from the original login rather than from this rotation.
        $tokens = $this->tokenService->generateToken(
            $request->user(),
            $rotatedToken->session_started_at
        );

        return $this->success([
            'user' => new UserResource($request->user()),
            ...$tokens,
        ], 200, 'Token refreshed successfully');
    }

    /**
     * Get the currently authenticated user.
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function me(Request $request): JsonResponse
    {
        return $this->success([
            'user' => new UserResource($request->user()),
        ]);
    }

    /**
     * Update the currently authenticated user's profile.
     *
     * @param  UpdateProfileRequest  $request
     * @return JsonResponse
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->updateProfileAction->handle(
            $request->user(),
            $request->validated(),
            $request->file('avatar')
        );

        return $this->success([
            'user' => new UserResource($user),
        ], 200, 'Profile updated successfully');
    }
}
