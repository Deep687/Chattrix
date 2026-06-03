<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\ApiResponser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\LoginUserRequest;
use App\Models\RefreshToken;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    use ApiResponser;

    /**
     * Register User
     * @param $request
     * @return JsonResponse
     */
    public function register(CreateUserRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
        ]);

        return response()->json([
            'data' => [
                'user' => $user
            ],
            'message' => 'User registered successfully',
        ], 201);
    }

    /**
     * Login User
     * @param Request $request
     * @return JsonResponse
     */
    public function login(LoginUserRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        if (!Auth::attempt($validatedData)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = Auth::user();

        $accessTokenExpirationInMinutes = config('sanctum.expiration');
        $refreshTokenExpirationInDays = config('auth_tokens.refresh_token_expiration_days');

        $accessToken = $user->createToken('auth_token', ['*'], now()->addMinutes((int) $accessTokenExpirationInMinutes))->plainTextToken;

        $refreshToken = Str::random(64);

        $this->createRefreshToken($user, $refreshToken);

        return response()->json([
            'data' => [
                'user' => $user,
                'access_token' => [
                    'access_token' => $accessToken,
                    'token_type' => 'Bearer',
                    'expires_in' => $accessTokenExpirationInMinutes * 60, // Standard is to use seconds
                ],
                'refresh_token' => [
                    'refresh_token' => $refreshToken,
                    'expires_in' => $refreshTokenExpirationInDays * 24 * 60 * 60, // Standard is to use seconds

                ],
            ],
            'message' => 'User logged in successfully',
        ]);
    }

    /**
     * Logout User
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        $bearerToken = $request->bearerToken();

        if ($bearerToken) {
            $accessToken = PersonalAccessToken::findToken($bearerToken);

            if ($accessToken) {
                RefreshToken::where('user_id', $accessToken->tokenable_id)->delete();
                $accessToken->delete();
            }
        }

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }


    /**
     * refresh token
     * @param Request $request
     * @return JsonResponse
     */

    public function refresh(Request $request): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        $user = $request->user();

        $user->currentAccessToken()->delete();

        $accessTokenExpirationInMinutes = config('sanctum.expiration');

        $accessToken = $user->createToken('auth_token', ['*'], now()->addMinutes((int) $accessTokenExpirationInMinutes))->plainTextToken;

        return response()->json([
            'data' => [
                'user' => $user,
                'token' => [
                    'access_token' => $accessToken,
                    'token_type' => 'Bearer',
                    'expires_in' => $accessTokenExpirationInMinutes * 60,
                ],
                'message' => 'Token refreshed successfully',
            ]
        ]);
    }


    /*
     * @param User $user, $token
     * @return JsonResponse
     */
    public function createRefreshToken(User $user, $token){
        RefreshToken::create([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addDay()
        ]);

    }
}
