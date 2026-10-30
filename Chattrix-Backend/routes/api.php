<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DocumentController;
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
        ->middleware('throttle:auth')
        ->name('auth.register');

    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:auth')
        ->name('auth.login');

    Route::post('/logout', [AuthController::class, 'logout'])
        ->middleware('throttle:session-token')
        ->name('auth.logout');

    Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware(['signed', 'throttle:verify-email'])
        ->name('verification.verify');

    Route::middleware('auth:sanctum')->group(function () {

        Route::get('/me', [AuthController::class, 'me'])->name('auth.me');
        Route::put('/me', [AuthController::class, 'update'])->name('auth.update');

        Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail'])
            ->middleware('throttle:verify-resend')
            ->name('verification.resend');
    });
});

/**
 * Token refresh auth
 */
Route::post('/auth/refresh', [AuthController::class, 'refresh'])
    ->name('auth.refresh')->middleware(['throttle:session-token', 'SanctumRefresh']);
/*
    |--------------------------------------------------------------------------
    | Workspace invitations
    |--------------------------------------------------------------------------
    */

/**
 * The preview sits outside the auth group because the invitee typically has no account yet;
 * the unguessable token is the only credential it needs, and it grants nothing but a look at
 * the workspace name. Accepting stays behind `auth:sanctum` + `verified` — membership requires
 * a real, verified identity to attach to.
 */
Route::get('/workspaces/invitations/{token}', [WorkspaceInvitationController::class, 'show'])
    ->middleware('throttle:invitations')
    ->name('workspaces.invitations.show');

Route::post('/workspaces/invitations/{token}/accept', [WorkspaceInvitationController::class, 'accept'])
    ->middleware(['auth:sanctum', 'verified', 'throttle:invitations'])
    ->name('workspaces.invitations.accept');

/*
    |--------------------------------------------------------------------------
    | Workspaces
    |--------------------------------------------------------------------------
    */

Route::middleware(['auth:sanctum', 'verified'])->group(function () {

    Route::get('/workspaces/{workspace}/members', [WorkspaceController::class, 'members'])->name('workspaces.members');

    Route::get('/workspaces/{workspace}/invitations', [WorkspaceInvitationController::class, 'index'])
        ->name('workspaces.invitations.index');

    Route::post('/workspaces/{workspace}/invitations', [WorkspaceInvitationController::class, 'store'])
        ->name('workspaces.invitations.store');

    Route::apiResource('workspaces', WorkspaceController::class);
});

/*
    |--------------------------------------------------------------------------
    | Documents
    |--------------------------------------------------------------------------
    |
    | Scoped bindings: `{document}` resolves only through `$workspace->documents()`, so another
    | tenant's document id is a 404 even to a user who passes this workspace's policy.
    */

Route::middleware(['auth:sanctum', 'verified'])->scopeBindings()->group(function () {

    Route::get('/workspaces/{workspace}/documents', [DocumentController::class, 'index'])
        ->name('workspaces.documents.index');

    Route::post('/workspaces/{workspace}/documents', [DocumentController::class, 'store'])
        ->middleware('throttle:uploads')
        ->name('workspaces.documents.store');

    Route::get('/workspaces/{workspace}/documents/{document}', [DocumentController::class, 'show'])
        ->name('workspaces.documents.show');

    Route::delete('/workspaces/{workspace}/documents/{document}', [DocumentController::class, 'destroy'])
        ->name('workspaces.documents.destroy');
});

/*
    |--------------------------------------------------------------------------
    | Users
    |--------------------------------------------------------------------------
    */

Route::middleware(['auth:sanctum', 'verified'])->group(function () {

    Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
});
