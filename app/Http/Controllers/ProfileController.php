<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class ProfileController extends Controller
{
    private const API = 'https://qmra.ae/api';

    public function index(Request $request)
    {
        $token       = $request->session()->get('api_token');
        $sessionUser = $request->session()->get('auth_user', []);
        $subscription = $request->session()->get('subscription');

        // Try to fetch fresh profile from API
        $apiUser = null;
        if ($token) {
            try {
                $res = Http::timeout(8)->withToken($token)->get(self::API . '/profile');
                if ($res->successful()) {
                    $body    = $res->json();
                    $apiUser = $body['data'] ?? $body;
                    // Refresh subscription if present in profile response
                    if (isset($apiUser['subscription'])) {
                        $sub = $apiUser['subscription'];
                        $subscription = [
                            'id'           => $sub['id']           ?? null,
                            'package_id'   => $sub['package_id']   ?? null,
                            'cars_count'   => $sub['cars_count']   ?? ($sub['package']['cars_count']   ?? 1),
                            'addons_count' => $sub['addons_count'] ?? ($sub['package']['addons_count'] ?? 0),
                            'title'        => $sub['package']['title'] ?? null,
                            'expires_at'   => $sub['expires_at']   ?? null,
                        ];
                        $request->session()->put('subscription', $subscription);
                    }
                }
            } catch (\Exception $e) {
                // API unavailable — fall back to session data
            }
        }

        // Merge: API data takes priority, fall back to session, then local auth
        $localUser = Auth::user();
        $user = [
            'id'    => $apiUser['id']    ?? $sessionUser['id']    ?? $localUser?->id,
            'name'  => $apiUser['name']  ?? $sessionUser['name']  ?? $localUser?->name,
            'email' => $apiUser['email'] ?? $sessionUser['email'] ?? $localUser?->email,
            'phone' => $apiUser['phone'] ?? $sessionUser['phone'] ?? $localUser?->phone,
        ];

        return Inertia::render('Phone/Profile', compact('user', 'subscription'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . Auth::id(),
            'phone' => 'nullable|string|max:20',
        ]);

        // Update local user
        Auth::user()->update($request->only(['name', 'email', 'phone']));

        // Try to update on API too
        $token = $request->session()->get('api_token');
        if ($token) {
            try {
                Http::timeout(10)->withToken($token)->put(self::API . '/profile', $request->only(['name', 'phone']));
            } catch (\Exception $e) {
                // API update failed silently
            }
        }

        // Refresh session user
        $request->session()->put('auth_user', array_merge(
            $request->session()->get('auth_user', []),
            ['name' => $request->name, 'email' => $request->email, 'phone' => $request->phone]
        ));

        return redirect()->route('profile');
    }

    public function destroy(Request $request)
    {
        $user = $request->user();
        Auth::logout();
        $user->delete();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }
}
