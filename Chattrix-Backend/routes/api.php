<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HubController;
use Illuminate\Support\Facades\Route;

/*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register'])
        ->middleware('throttle:6,1')
        ->name('auth.register');

    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:6,1')
        ->name('auth.login');

    Route::post('/logout', [AuthController::class, 'logout'])
        ->middleware('throttle:6,1')
        ->name('auth.logout');

    Route::middleware('auth:sanctum')->group(function () {

        Route::get('/me', [AuthController::class, 'me'])->name('auth.me');
    });
});

/**
 * Token refresh auth
 */
Route::post('/auth/refresh', [AuthController::class, 'refresh'])
    ->name('auth.refresh')->middleware('SanctumRefresh');
/*
    |--------------------------------------------------------------------------
    | Hubs
    |--------------------------------------------------------------------------
    */

Route::middleware('auth:sanctum')->group(function () {

    Route::apiResource('hubs', HubController::class);
});
