<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HubController;
use App\Http\Controllers\UserController;
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
        Route::put('/me', [AuthController::class, 'update'])->name('auth.update');
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

    Route::get('/hubs/me', [HubController::class, 'myHubs']);

    Route::post('/hubs/{hub}/join', [HubController::class, 'join'])->name('hubs.join');
    Route::get('/hubs/{hub}/members', [HubController::class, 'members'])->name('hubs.members');

    Route::apiResource('hubs', HubController::class);
});

/*
    |--------------------------------------------------------------------------
    | Users
    |--------------------------------------------------------------------------
    */

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
});
