<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\LoginUserRequest;
use App\Services\AuthService;
use App\Services\TokenService;
use App\Http\Resources\UserResource;

/**
 * Handles authentication-related requests like registration, login, logout, and token refreshing.
 */
class AuthController extends Controller
{
    /**
     * Create a new AuthController instance.
     *
     * @param AuthService $AuthService The service for authentication logic.
     * @param TokenService $tokenService The service for token generation.
     */
    public function __construct(private AuthService $AuthService, private TokenService $tokenService) {}

    use ApiResponser;

    /**
     * Register a new user.
     *
     * @param CreateUserRequest $request The request containing user registration data.
     * @return JsonResponse
     */
    public function register(CreateUserRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        $user = $this->AuthService->register($validatedData);

        return $this->success([
            'user' => new UserResource($user)
        ], 201, 'User registered successfully');
    }

    /**
     * Authenticate a user and return tokens.
     *
     * @param LoginUserRequest $request The request containing user login credentials.
     * @return JsonResponse
     */
    public function login(LoginUserRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        $user =  $this->AuthService->AttemptLogin($validatedData);

        if (!$user) {
            return $this->error(null, 401, 'Invalid credentials');
        }

        $tokens = $this->tokenService->generateToken($user);

        return $this->success([
            'user' => new UserResource($user),
            ...$tokens
        ], 200, 'User logged in successfully');
    }

    /**
     * Log out the authenticated user by invalidating their tokens.
     *
     * @param Request $request The incoming HTTP request.
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {

        $this->AuthService->AttemptLogout($request->bearerToken());

        return $this->success(null, 200, 'Logged out successfully');
    }


    /**
     * Refresh the authentication tokens for the currently authenticated user.
     *
     * @param Request $request The incoming HTTP request, expecting a valid refresh token.
     * @return JsonResponse
     */

    public function refresh(Request $request): JsonResponse
    {
        // Assuming a `sanctumRefresh` middleware has already authenticated the user.
        // If the middleware fails, it will return a 401, and this code will not be reached.
        if (!Auth::check()) {
            return $this->error(null, 401, 'Unauthenticated');
        }

        $user = Auth::user();

        // Invalidate the old refresh token and all old access tokens.
        $this->AuthService->invalidateTokensAfterRefresh($request);

        $tokens = $this->tokenService->generateToken($user);

        return $this->success([
            'user' => new UserResource($user),
            ...$tokens
        ], 200, 'Token refreshed successfully');
    }

    /**
     * Get the currently authenticated user.
     *
     * Retrieves the authenticated user's information from the current access token.
     *
     * @param Request $request The incoming authenticated request.
     * @return JsonResponse
     */
    public function me(Request $request): JsonResponse
    {
        return $this->success([
            'user' => new UserResource($request->user()),
        ]);
    }
}
