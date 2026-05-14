<?php

use App\Http\Middleware\CheckSubscription;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Support\Header;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);
        $middleware->alias([
            'subscribed' => CheckSubscription::class,
        ]);
        $middleware->validateCsrfTokens(except: [
            '*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Inertia XHR requests are "ajax" and may match expectsJson(); force validation
        // to redirect+session so shared props "errors" populate (see inertia-laravel Middleware).
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            if ($request->header(Header::INERTIA) && $e instanceof ValidationException) {
                return false;
            }

            return $request->expectsJson();
        });
    })->create();
