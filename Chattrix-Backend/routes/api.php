<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HubController;

/*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register'])
        ->name('auth.register');

    Route::post('/login', [AuthController::class, 'login'])
        ->name('auth.login');

    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/logout', [AuthController::class, 'logout'])
            ->name('auth.logout');

        Route::get('/me', function (Request $request) {
            return $request->user();
        })->name('auth.me');
    });
});

/*
    |--------------------------------------------------------------------------
    | Hubs
    |--------------------------------------------------------------------------
    */

Route::middleware('auth:sanctum')->group(function () {

    Route::apiResource('hubs', HubController::class);
});
