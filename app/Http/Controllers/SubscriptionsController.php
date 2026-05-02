<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class SubscriptionsController extends Controller
{
    private $API;

    public function __construct()
    {
        $this->API = env('APP_BACKEND_URL').'/api';
    }

    public function index(Request $request)
    {
        $token = $request->session()->get('api_token');

        // After Ziina payment the external API marks the subscription active but never
        // calls our callback, so the session has no subscription yet. Re-check the API
        // on every visit to /subscriptions and redirect home if we find an active one.
        // if ($token) {
        //     try {
        //         $profileRes = Http::timeout(8)->withToken($token)->get(self::API . '/profile');
        //         if ($profileRes->successful()) {
        //             $profile = $profileRes->json('data') ?? $profileRes->json();
        //             $sub     = $profile['subscription'] ?? null;
        //             if ($sub && ($sub['status'] ?? '') === 'active') {
        //                 $expiresAt = $sub['expires_at'] ?? null;
        //                 if (!$expiresAt || !Carbon::parse($expiresAt)->isPast()) {
        //                     $request->session()->put('subscription', [
        //                         'id'           => $sub['id']           ?? null,
        //                         'package_id'   => $sub['package_id']   ?? null,
        //                         'status'       => 'active',
        //                         'cars_count'   => $sub['cars_count']   ?? ($sub['package']['cars_count']   ?? 1),
        //                         'addons_count' => $sub['addons_count'] ?? ($sub['package']['addons_count'] ?? 0),
        //                         'title'        => $sub['package']['title'] ?? null,
        //                         'expires_at'   => $expiresAt,
        //                     ]);
        //                     return redirect('/');
        //                 }
        //             }
        //         }
        //     } catch (\Exception $e) {
        //         // Profile fetch failed — show subscription page normally
        //     }
        // }

        $packages = [];
        $res = Http::timeout(10)->withToken($token)->get($this->API.'/packages');
        if ($res->successful()) {
            $packages = $res->json('data') ?? [];
        }

        $subscription = $request->session()->get('subscription');
        $paymentStatus = $request->query('payment_status');

        $sessionId = $request->session()->getId();

        return Inertia::render('Phone/Subscriptions', compact('packages', 'subscription', 'sessionId', 'paymentStatus'));
    }

    public function subscribe(Request $request, int $packageId, string $period)
    {

        // return response()->json(['error_data' => $request->all() + ['packageId' => $packageId]], 500);

        // $request->validate(['period' => 'required|in:monthly,yearly']);

        $token = $request->session()->get('api_token');

        $res = Http::timeout(15)->withToken($token)->post(
            $this->API.'/auth/subscribe/'.$packageId,
            ['period' => $period]
        );

        if ($res->successful()) {
            $data = $res->json('data') ?? [];

            // API may return full subscription data or just a payment URL string
            // if (is_array($data)) {
            //     $sub = $data['subscription'] ?? [];
            //     $pkg = $data['package']      ?? [];

            //     // Only store subscription if it is active
            //     if (($sub['status'] ?? '') === 'active') {
            //         $request->session()->put('subscription', [
            //             'id'           => $sub['id']         ?? null,
            //             'package_id'   => $sub['package_id'] ?? $packageId,
            //             'status'       => 'active',
            //             'cars_count'   => (int) ($pkg['cars_count']   ?? $sub['cars_count']   ?? 1),
            //             'addons_count' => (int) ($pkg['addons_count'] ?? $sub['addons_count'] ?? 0),
            //             'title'        => $pkg['title']      ?? null,
            //             'expires_at'   => $sub['expires_at'] ?? null,
            //         ]);
            //     }
            //     return response()->json(['payment_url' => null]);
            // }

            // data is a payment URL string (Ziina) — do NOT store subscription yet,
            // payment is not confirmed. The callback will store it after confirmation.
            return response()->json(['payment_url' => $data]);
        }

        return response()->json([
            'error' => $res->json('message') ?? 'حدث خطأ، حاول مرة أخرى',
        ], $res->status() ?: 500);
    }

    /**
     * Public HTTPS endpoint for Ziina / backend payment success redirects.
     * Forwards query string to the NativePHP custom scheme so the installed app opens /subscriptions/callback.
     */
    public function mobileReturn(Request $request)
    {
        $scheme = config('nativephp.deeplink_scheme');
        if (! is_string($scheme) || $scheme === '') {
            abort(503, 'Deep link scheme is not configured (NATIVEPHP_DEEPLINK_SCHEME).');
        }

        $query = array_filter(
            $request->query(),
            static fn ($value) => $value !== null && $value !== ''
        );
        $deepUrl = $scheme.'://subscriptions/callback'.(count($query) ? '?'.http_build_query($query) : '');

        // HTML bounce: more reliable than Location: custom-scheme from some mobile browsers after payment.
        return response()->view('subscriptions.mobile-return', ['deepUrl' => $deepUrl]);
    }

    public function callback(Request $request)
    {
        $status = strtolower((string) $request->query('payment_status', 'pending'));
        // After payment, refresh subscription from API
        $token = $request->session()->get('api_token');

        if ($token) {
            $res = Http::timeout(10)->withToken($token)->get($this->API . '/profile');
            if ($res->successful()) {
                $profile = $res->json('data') ?? $res->json();
                $sub = $profile['subscription'] ?? null;
                if ($sub && ($sub['status'] ?? '') === 'active') {
                    $request->session()->put('subscription', [
                        'id' => $sub['id'] ?? null,
                        'package_id' => $sub['package_id'] ?? null,
                        'status' => 'active',
                        'cars_count' => $sub['cars_count'] ?? ($sub['package']['cars_count'] ?? 1),
                        'addons_count' => $sub['addons_count'] ?? ($sub['package']['addons_count'] ?? 0),
                        'title' => $sub['package']['title'] ?? null,
                        'expires_at' => $sub['expires_at'] ?? null,
                    ]);
                } else {
                    // Payment pending or failed — clear any stale subscription
                    $request->session()->forget('subscription');
                }
            }
        }

        return redirect('/subscriptions?payment_status='.urlencode($status));
    }
}
