<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserDataController;
use Illuminate\Support\Facades\Route;

// ── Auth routes ───────────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);
    });
});

// ── User data sync (used by NativePHP mobile app) ─────────────────────────────
Route::middleware('auth:sanctum')->prefix('user')->group(function () {
    Route::get('/data',                  [UserDataController::class, 'pull']);
    Route::post('/vehicles',             [UserDataController::class, 'storeVehicle']);
    Route::put('/vehicles/{id}',         [UserDataController::class, 'updateVehicle']);
    Route::delete('/vehicles/{id}',      [UserDataController::class, 'destroyVehicle']);
    Route::post('/notes',                [UserDataController::class, 'storeNote']);
    Route::put('/notes/{id}',            [UserDataController::class, 'updateNote']);
    Route::delete('/notes/{id}',         [UserDataController::class, 'destroyNote']);
});

use App\Http\Controllers\ContactController;

Route::prefix('admin/messages')->group(function () {
    Route::get('/',            [ContactController::class, 'adminIndex']);
    Route::post('/{id}/reply', [ContactController::class, 'reply']);
    Route::delete('/{id}',     [ContactController::class, 'destroy']);
    Route::delete('/',         [ContactController::class, 'destroyAll']);
});
