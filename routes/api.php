<?php

use App\Http\Controllers\Api\AuthController;
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

// ── Admin contact messages (no CSRF — external dashboard access) ──────────────
use App\Http\Controllers\ContactController;

Route::prefix('admin/messages')->group(function () {
    Route::get('/',            [ContactController::class, 'adminIndex']);
    Route::post('/{id}/reply', [ContactController::class, 'reply']);
    Route::delete('/{id}',     [ContactController::class, 'destroy']);
    Route::delete('/',         [ContactController::class, 'destroyAll']);
});
