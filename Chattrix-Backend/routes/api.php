<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\WorkspaceInvitationController;
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
    ->name('auth.refresh')->middleware(['throttle:6,1', 'SanctumRefresh']);
/*
    |--------------------------------------------------------------------------
    | Workspaces
    |--------------------------------------------------------------------------
    */

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/workspaces/{workspace}/members', [WorkspaceController::class, 'members'])->name('workspaces.members');

    Route::post('/workspaces/{workspace}/invitations', [WorkspaceInvitationController::class, 'store'])
        ->name('workspaces.invitations.store');

    Route::apiResource('workspaces', WorkspaceController::class);
});

/*
    |--------------------------------------------------------------------------
    | Users
    |--------------------------------------------------------------------------
    */

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
});
