<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
    public function handle(Request $request, Closure $next): Response
    {
        // No api_token → back to login
        if (! $request->session()->get('api_token')) {
            return redirect('/login');
        }

        // No subscription yet → pick a plan first
        if (! $request->session()->get('subscription')) {
            return redirect('/subscriptions');
        }

        return $next($request);
    }
}
