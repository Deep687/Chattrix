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

    Route::post('/logout', [AuthController::class, 'logout'])
        ->name('auth.logout');

    Route::middleware('auth:sanctum')->group(function () {

        Route::get('/me', function (Request $request) {
            return $request->user();
        })->name('auth.me');
    });
});


/**
 * Token refresh auth ( middleware or guard will be auth:sanctum-refresh)
 */
    Route::post('/auth/refresh', [AuthController::class, 'refresh'])
        ->name('auth.refresh')->middleware('auth:sanctum-refresh');
/*
    |--------------------------------------------------------------------------
    | Hubs
    |--------------------------------------------------------------------------
    */

Route::middleware('auth:sanctum')->group(function () {

    Route::apiResource('hubs', HubController::class);
});
