<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\MovementController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::apiResource('products', ProductController::class);
    Route::post('/movements', [MovementController::class, 'store']);
    Route::get('/movements', [MovementController::class, 'index']);

    Route::middleware(['role:admin'])->group(function () {
        Route::get('/users', [UsersController::class, 'index']);
        Route::get('/users/{user}', [UsersController::class, 'show']);
        Route::post('/users', [UsersController::class, 'store']);
        Route::put('/users/{id}', [UsersController::class, 'update']);
        Route::patch('/users/{id}/active', [UsersController::class, 'updateActive']);
        // Route::delete('/users/{id}', [UsersController::class, 'destroy']);
        Route::delete('/users/{user}', [UsersController::class, 'destroy']);
    });
});