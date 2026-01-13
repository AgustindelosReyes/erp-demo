<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\MovementController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\IntegrationController;
use App\Http\Controllers\SessionController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::apiResource('products', ProductController::class);
    Route::get('/products/stats/summary', [ProductController::class, 'stats']);
    Route::apiResource('movements', MovementController::class);
    Route::get('/movements/stats/summary', [MovementController::class, 'stats']);

    // Settings routes
    Route::prefix('settings')->group(function () {
        Route::get('/company', [SettingsController::class, 'getCompanySettings']);
        Route::put('/company', [SettingsController::class, 'updateCompanySettings']);
        Route::get('/system', [SettingsController::class, 'getSystemSettings']);
        Route::put('/system', [SettingsController::class, 'updateSystemSettings']);
        Route::get('/billing', [SettingsController::class, 'getBillingSettings']);
        Route::put('/billing', [SettingsController::class, 'updateBillingSettings']);
        Route::get('/notifications', [SettingsController::class, 'getNotificationSettings']);
        Route::put('/notifications', [SettingsController::class, 'updateNotificationSettings']);
        Route::get('/backup', [SettingsController::class, 'getBackupSettings']);
        Route::put('/backup', [SettingsController::class, 'updateBackupSettings']);
    });

    // Backup routes
    Route::apiResource('backups', BackupController::class);
    Route::get('/backups/{id}/download', [BackupController::class, 'download']);
    Route::post('/backups/{id}/restore', [BackupController::class, 'restore']);

    // Integration routes
    Route::get('/integrations', [IntegrationController::class, 'index']);
    Route::post('/integrations/{provider}/connect', [IntegrationController::class, 'connect']);
    Route::delete('/integrations/{provider}/disconnect', [IntegrationController::class, 'disconnect']);
    Route::get('/integrations/api-keys', [IntegrationController::class, 'getApiKeys']);
    Route::post('/integrations/api-keys/regenerate', [IntegrationController::class, 'regenerateApiKeys']);

    // Session routes
    Route::get('/sessions', [SessionController::class, 'index']);
    Route::delete('/sessions/{id}', [SessionController::class, 'destroy']);
    Route::post('/auth/change-password', [SessionController::class, 'changePassword']);
    Route::post('/auth/2fa/enable', [SessionController::class, 'enableTwoFactor']);
    Route::post('/auth/2fa/disable', [SessionController::class, 'disableTwoFactor']);

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