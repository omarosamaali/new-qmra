<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;

class CheckSubscription
{
    public function handle(Request $request, Closure $next): Response
    {
        // No api_token → back to login
        if (! $request->session()->get('api_token')) {
            return redirect('/login');
        }

        $subscription = $request->session()->get('subscription');

        // No subscription → pick a plan first
        if (! $subscription) {
            return redirect('/subscriptions');
        }

        // Subscription expired → clear it and redirect to subscriptions
        $expiresAt = $subscription['expires_at'] ?? null;
        if ($expiresAt && Carbon::parse($expiresAt)->isPast()) {
            $request->session()->forget('subscription');
            return redirect('/subscriptions');
        }

        return $next($request);
    }
}
