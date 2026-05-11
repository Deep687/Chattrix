<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Traits\ApiResponser;
use Illuminate\Http\JsonResponse;
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

        // Create Sanctum Token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            $user,
            'message' => 'User registered successfully',
        ], 201)->withCookie(cookie('auth_token', $token, 60 * 24, null, null, false, true)); // httpOnly cookie

    }


    public function login(LoginUserRequest $request): JsonResponse
    {
        $validatedData = $request->validated();
        if(!Auth::attempt($validatedData)){
            return $this->error(null,401,'Invalid credentials');
        }
        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'data' => $user,
            'message' => 'User logged in successfully',
        ], 200)->withCookie(cookie('auth_token', $token, 60 * 24, null, null, false, true)); // httpOnly cookie
    }
}
