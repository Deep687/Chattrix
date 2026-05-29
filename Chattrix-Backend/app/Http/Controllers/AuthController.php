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

        $token = $user->createToken('auth_token')->plainTextToken;

        $tokenExpirationInMinutes = config('sanctum.expiration');

        return response()->json([
            'data' => [
                'user' => $user,
                'token' => [
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                    'expires_in' => $tokenExpirationInMinutes * 60, // Standard is to use seconds
                ],
            ],
            'message' => 'User logged in successfully',
        ]);
    }

    /**
     * Logout User
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }


    /**
     * refresh token
     */

    public function refresh(Request $request): JsonResponse{
        if(!Auth::check()){
        return response()->json(['message' => 'Unauthenticated'], 401);
        }
         $user = $request->user();

         $user->currentAccessToken()->delete();

         $token = $user->createToken('auth_token')->plainTextToken;

         $tokenExpirationInMinutes = config('sanctum.expiration');

         return response()->json([
            'data' => [
                'user' => $user,
                    'token' => [
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                    'expires_in' => $tokenExpirationInMinutes * 60,
                ],
                       'message' => 'Token refreshed successfully',

            ]

            ]);



            }
}
