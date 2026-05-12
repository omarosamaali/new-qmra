<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\CloudSync;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AuthController extends Controller
{
    private $API;

    public function __construct()
    {
        $this->API = env('APP_BACKEND_URL') . '/api';
    }

    // ── Register ──────────────────────────────────────────────────────────────

    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    public function register(Request $request)
    {
        $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email',
            'phone'                 => 'nullable|string|max:20',
            'password'              => 'required|min:8|confirmed',
            'password_confirmation' => 'required',
        ], [
            'name.required'      => 'الاسم مطلوب',
            'email.required'     => 'البريد الإلكتروني مطلوب',
            'email.email'        => 'البريد الإلكتروني غير صحيح',
            'password.required'  => 'كلمة المرور مطلوبة',
            'password.min'       => 'كلمة المرور 8 أحرف على الأقل',
            'password.confirmed' => 'كلمتا المرور غير متطابقتين',
        ]);

        $response = Http::timeout(15)->post($this->API . '/auth/register', [
            'name'                  => $request->input('name'),
            'email'                 => $request->input('email'),
            'phone'                 => $request->input('phone'),
            'password'              => $request->input('password'),
            'password_confirmation' => $request->input('password_confirmation'),
        ]);

        if ($response->successful()) {
            $data    = $response->json();
            $apiData = $data['data'] ?? $data;
            $apiUser = $apiData['user']  ?? [];
            $token   = $apiData['token'] ?? null;

            try {
                $localUser = $this->findOrCreateLocalUser($apiUser);
                Auth::login($localUser, true);
            } catch (\Exception $e) {
                Log::error('Register findOrCreateLocalUser failed: ' . $e->getMessage());
            }

            $request->session()->regenerate();
            $request->session()->put('api_token', $token);
            $request->session()->put('auth_user', $apiUser);
            $request->session()->forget('subscription'); // clear any stale subscription before re-fetching

            // Fetch subscription using the fresh token
            if ($token) {
                try {
                    $profileRes = Http::timeout(8)->withToken($token)->get($this->API . '/profile');
                    if ($profileRes->successful()) {
                        $profileData = $profileRes->json();
                        $profile     = $profileData['data'] ?? $profileData;
                        $sub         = $profile['subscription'] ?? null;
                        if ($sub && ($sub['status'] ?? '') === 'active') {
                            $request->session()->put('subscription', [
                                'id'           => $sub['id']           ?? null,
                                'package_id'   => $sub['package_id']   ?? null,
                                'status'       => 'active',
                                'cars_count'   => $sub['cars_count']   ?? ($sub['package']['cars_count']   ?? 1),
                                'addons_count' => $sub['addons_count'] ?? ($sub['package']['addons_count'] ?? 0),
                                'title'        => $sub['package']['title'] ?? null,
                                'expires_at'   => $sub['expires_at']   ?? null,
                            ]);
                        }
                    }
                } catch (\Exception $e) {
                    // Profile fetch failed — new user, redirect to /subscriptions is correct
                }
            }

            // Pull user data from cloud into local SQLite (restores data after reinstall)
            try { CloudSync::pull(); } catch (\Exception $e) { Log::warning('CloudSync pull after register: ' . $e->getMessage()); }

            return redirect('/');
        }

        $errors  = $response->json('errors')  ?? [];
        $message = $response->json('message') ?? 'حدث خطأ، حاول مرة أخرى';

        if (!empty($errors)) {
            return back()->withErrors($errors)->withInput();
        }

        return back()->withErrors(['email' => $message])->withInput();
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ], [
            'email.required'    => 'البريد الإلكتروني مطلوب',
            'email.email'       => 'البريد الإلكتروني غير صحيح',
            'password.required' => 'كلمة المرور مطلوبة',
        ]);

        try {
            $response = Http::timeout(15)->post($this->API . '/auth/login', [
                'email'    => $request->input('email'),
                'password' => $request->input('password'),
            ]);
        } catch (\Exception $e) {
            Log::error('Login API failed: ' . $e->getMessage());
            return back()->withErrors(['email' => 'تعذّر الاتصال بالخادم، حاول مرة أخرى'])->onlyInput('email');
        }

        Log::info('Login API status: ' . $response->status() . ' body: ' . substr($response->body(), 0, 300));

        if ($response->successful()) {
            $data    = $response->json();
            $apiData = $data['data'] ?? $data;          // supports both {data:{...}} and flat
            $apiUser = $apiData['user']  ?? [];
            $token   = $apiData['token'] ?? null;

            try {
                $localUser = $this->findOrCreateLocalUser($apiUser);
                Auth::login($localUser, true);
            } catch (\Exception $e) {
                Log::error('findOrCreateLocalUser failed: ' . $e->getMessage());
            }

            $request->session()->regenerate();
            $request->session()->put('api_token', $token);
            $request->session()->put('auth_user', $apiUser);
            $request->session()->forget('subscription'); // clear any stale subscription before re-fetching

            // Fetch subscription using the fresh token
            if ($token) {
                try {
                    $profileRes = Http::timeout(8)->withToken($token)->get($this->API . '/profile');
                    if ($profileRes->successful()) {
                        $profileData = $profileRes->json();
                        $profile     = $profileData['data'] ?? $profileData;
                        $sub         = $profile['subscription'] ?? null;
                        if ($sub && ($sub['status'] ?? '') === 'active') {
                            $request->session()->put('subscription', [
                                'id'           => $sub['id']           ?? null,
                                'package_id'   => $sub['package_id']   ?? null,
                                'status'       => 'active',
                                'cars_count'   => $sub['cars_count']   ?? ($sub['package']['cars_count']   ?? 1),
                                'addons_count' => $sub['addons_count'] ?? ($sub['package']['addons_count'] ?? 0),
                                'title'        => $sub['package']['title'] ?? null,
                                'expires_at'   => $sub['expires_at']   ?? null,
                            ]);
                        }
                    }
                } catch (\Exception $e) {
                    // Profile fetch failed — subscription remains null, user goes to /subscriptions
                }
            }

            // Pull user data from cloud into local SQLite (restores data after reinstall)
            try { CloudSync::pull(); } catch (\Exception $e) { Log::warning('CloudSync pull after login: ' . $e->getMessage()); }

            // Push any offline-created records that have no server_id yet
            try { CloudSync::flushQueue(); } catch (\Exception $e) { }

            return redirect()->intended('/');
        }

        return back()->withErrors([
            'email' => $response->json('message') ?? 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        ])->onlyInput('email');
    }

    // ── Forgot Password ───────────────────────────────────────────────────────

    public function showForgotPassword()
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function sendResetCode(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        try {
            $response = Http::timeout(15)->post($this->API . '/auth/send-reset-code', [
                'email' => $request->input('email'),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'تعذّر الاتصال بالخادم'], 500);
        }

        if ($response->successful()) {
            return response()->json($response->json());
        }

        return response()->json(
            ['message' => $response->json('message') ?? 'حدث خطأ، حاول مرة أخرى'],
            $response->status()
        );
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'                 => 'required|email',
            'code'                  => 'required',
            'password'              => 'required|min:8|confirmed',
            'password_confirmation' => 'required',
        ]);

        try {
            $response = Http::timeout(15)->post($this->API . '/auth/update-password', [
                'email'                 => $request->input('email'),
                'code'                  => $request->input('code'),
                'password'              => $request->input('password'),
                'password_confirmation' => $request->input('password_confirmation'),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'تعذّر الاتصال بالخادم'], 500);
        }

        if ($response->successful()) {
            return response()->json($response->json());
        }

        return response()->json(
            ['message' => $response->json('message') ?? 'حدث خطأ، حاول مرة أخرى'],
            $response->status()
        );
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    public function logout(Request $request)
    {
        $token = $request->session()->get('api_token');
        if ($token) {
            Http::timeout(5)->withToken($token)->post($this->API . '/auth/logout');
        }

        Auth::logout();
        $request->session()->forget(['api_token', 'auth_user', 'subscription']);
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function findOrCreateLocalUser(array $apiUser): User
    {
        $email = $apiUser['email'] ?? '';

        return User::firstOrCreate(
            ['email' => $email],
            [
                'name'     => $apiUser['name']  ?? 'User',
                'phone'    => $apiUser['phone'] ?? null,
                'password' => Hash::make(Str::random(32)),
            ]
        );
    }
}
