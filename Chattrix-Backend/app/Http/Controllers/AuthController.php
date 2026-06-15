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

        return response()->json([
            'data' => [
                'user' => new UserResource($user)
            ],
            'message' => 'User registered successfully',
        ], 201);
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
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $tokens = $this->tokenService->generateToken($user);

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                ...$tokens
            ],
            'message' => 'User logged in successfully',
        ]);
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

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
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
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $user = Auth::user();

        // Invalidate the old refresh token and all old access tokens.
        $this->AuthService->invalidateTokensAfterRefresh($request);

        $tokens = $this->tokenService->generateToken($user);

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                ...$tokens
            ],
            'message' => 'Token refreshed successfully',
        ]);
    }
}
