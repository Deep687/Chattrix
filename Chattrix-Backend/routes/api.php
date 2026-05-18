<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HubController;

Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/login',[AuthController::class,'login'])->name('login');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout',[AuthController::class,'logout'])->name('logout');

    Route::get('/hubs',[HubController::class,'index'])->name('hubs');
    Route::post('/createHub',[HubController::class,'createHub'])->name('createHub');
});
