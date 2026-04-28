<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ServicesController;
use App\Http\Controllers\SubscriptionsController;
use App\Http\Controllers\VehiclesController;
use App\Http\Controllers\RemindersController;
use App\Http\Controllers\RecordsController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\WarrantyController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

// ── Auth routes
Route::get('/login',    [AuthController::class, 'showLogin'])->name('login');
Route::post('/login',   [AuthController::class, 'login']);
Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register',[AuthController::class, 'register']);
Route::post('/logout',  [AuthController::class, 'logout'])->name('logout');
Route::get('/forgot-password',          [AuthController::class, 'showForgotPassword'])->name('forgot-password');
Route::post('/forgot-password/send-code',[AuthController::class, 'sendResetCode']);
Route::post('/forgot-password/reset',   [AuthController::class, 'resetPassword']);

// ── Subscription callback (after Ziina payment redirect)
Route::get('/subscriptions/callback', [SubscriptionsController::class, 'callback'])->middleware('auth');

// ── Subscription page (auth but NOT subscription-gated — user must be able to reach it freely)
Route::middleware('auth')->group(function () {
    Route::get('/subscriptions',          [SubscriptionsController::class, 'index'])->name('subscriptions');
    Route::post('/subscriptions/{id}',    [SubscriptionsController::class, 'subscribe']);
    Route::get('/profile',  [ProfileController::class, 'index'])->name('profile');
    Route::put('/profile',  [ProfileController::class, 'update'])->name('profile.update');
    Route::patch('/profile',[ProfileController::class, 'update']);
    Route::delete('/profile',[ProfileController::class, 'destroy'])->name('profile.destroy');
});

// ── Public info pages (no login required)
Route::get('/contact', fn() => Inertia::render('Phone/Contact'));
Route::post('/contact', [ContactController::class, 'store']);
Route::get('/about', function () {
    $settings = [];
    try {
        $res = Http::timeout(6)->get('https://qmra.ae/api/site-settings');
        if ($res->successful()) $settings = $res->json('data') ?? $res->json();
    } catch (\Exception $e) {}
    return Inertia::render('Phone/About', [
        'aboutUs' => $settings['about_us'] ?? null,
    ]);
});
Route::get('/terms', function () {
    $settings = [];
    try {
        $res = Http::timeout(6)->get('https://qmra.ae/api/site-settings');
        if ($res->successful()) $settings = $res->json('data') ?? $res->json();
    } catch (\Exception $e) {}
    return Inertia::render('Phone/Terms', [
        'privacyPolicy'      => $settings['privacy_policy']      ?? null,
        'termsAndConditions' => $settings['terms_and_conditions'] ?? null,
    ]);
});

// ── All other protected routes (require auth + active subscription)
Route::middleware(['auth', 'subscribed'])->group(function () {
    Route::get('/', [HomeController::class, 'index'])->name('home');

    Route::post('/vehicles',          [VehiclesController::class, 'store']);
    Route::put('/vehicles/{id}',      [VehiclesController::class, 'update']);
    Route::delete('/vehicles/{id}',   [VehiclesController::class, 'destroy']);
    Route::post('/vehicles/{id}/link',  [VehiclesController::class, 'link']);
    Route::post('/vehicles/{id}/unlink',[VehiclesController::class, 'unlink']);

    Route::get('/reminders',              [RemindersController::class, 'index']);
    Route::post('/reminders',             [RemindersController::class, 'store']);
    Route::put('/reminders/{id}',         [RemindersController::class, 'update']);
    Route::delete('/reminders/{id}',      [RemindersController::class, 'destroy']);
    Route::post('/reminders/{id}/complete',[RemindersController::class, 'complete']);
    Route::get('/notes',     fn() => Inertia::render('Phone/Notes'));
    Route::get('/services',  [ServicesController::class, 'index']);
    Route::post('/services', [ServicesController::class, 'store']);
    Route::delete('/services/{id}', [ServicesController::class, 'destroy']);
    Route::get('/records',   [RecordsController::class, 'index']);
    Route::get('/add-vehicle', function (\Illuminate\Http\Request $req) {
        $userId = \Illuminate\Support\Facades\Auth::id() ?? 1;
        $count  = \App\Models\Vehicle::where('user_id', $userId)->count();

        // Try to refresh subscription from profile API
        $token = $req->session()->get('api_token');
        if ($token) {
            try {
                $res = Http::timeout(6)->withToken($token)->get('https://qmra.ae/api/profile');
                if ($res->successful()) {
                    $profile = $res->json('data') ?? $res->json();
                    $sub = $profile['subscription'] ?? null;
                    $pkg = $profile['package']      ?? null;
                    if ($sub && ($sub['status'] ?? '') === 'active') {
                        $stored = [
                            'id'           => $sub['id']         ?? null,
                            'package_id'   => $sub['package_id'] ?? null,
                            'status'       => 'active',
                            'cars_count'   => (int) ($pkg['cars_count']   ?? $sub['cars_count']   ?? 1),
                            'addons_count' => (int) ($pkg['addons_count'] ?? $sub['addons_count'] ?? 0),
                            'title'        => $pkg['title']      ?? null,
                            'expires_at'   => $sub['expires_at'] ?? null,
                        ];
                        $req->session()->put('subscription', $stored);
                    }
                }
            } catch (\Exception $e) {}
        }

        $sub   = $req->session()->get('subscription', []);
        $limit = $sub['cars_count'] ?? 1;

        return \Inertia\Inertia::render('Phone/AddVehicle', [
            'vehicleCount' => $count,
            'carsLimit'    => $limit,
        ]);
    });
    Route::get('/warranty',  [WarrantyController::class, 'index']);
    Route::post('/warranty', [WarrantyController::class, 'store']);
    Route::delete('/warranty/{id}', [WarrantyController::class, 'destroy']);
    Route::get('/add-service', fn() => Inertia::render('Phone/AddService'));
    Route::get('/add',         fn() => Inertia::render('Phone/Add'));
});

// ── Car routes
Route::get('/car', fn() => Inertia::render('Car/Onboarding'));

// Generate a fresh link code (stored in cache, expires in 10 min)
Route::post('/api/car/generate-code', function () {
    $code = strtoupper(\Illuminate\Support\Str::random(4)) . '-' . strtoupper(\Illuminate\Support\Str::random(4));
    \Illuminate\Support\Facades\Cache::put('car_code:' . $code, true, now()->addMinutes(10));
    return response()->json(['code' => $code, 'expires_in' => 600]);
});

// Validate a link code (called by phone app before linking)
Route::get('/api/car/validate-code/{code}', function (string $code) {
    $valid = \Illuminate\Support\Facades\Cache::has('car_code:' . strtoupper($code));
    return response()->json(['valid' => $valid]);
});

// Get vehicle data by link_code
Route::get('/api/car/vehicle/{linkCode}', function (string $linkCode) {
    $vehicle = \App\Models\Vehicle::where('link_code', strtoupper($linkCode))
        ->where('is_linked', true)
        ->first();
    if (!$vehicle) return response()->json(['error' => 'not found'], 404);
    return response()->json([
        'id'                   => $vehicle->id,
        'nameAr'               => $vehicle->name_ar,
        'nameEn'               => $vehicle->name_en,
        'brand'                => $vehicle->brand,
        'plateNumber'          => $vehicle->plate_number,
        'color'                => $vehicle->color,
        'year'                 => $vehicle->year,
        'km'                   => $vehicle->km,
        'type'                 => $vehicle->type,
        'registrationExpiry'   => $vehicle->registration_expiry?->toDateString(),
        'insuranceExpiry'      => $vehicle->insurance_expiry?->toDateString(),
    ]);
});

// Get upcoming reminders by link_code
Route::get('/api/car/reminders/{linkCode}', function (string $linkCode) {
    $vehicle = \App\Models\Vehicle::where('link_code', strtoupper($linkCode))
        ->where('is_linked', true)
        ->first();
    if (!$vehicle) return response()->json([]);

    $reminders = \App\Models\Reminder::where('vehicle_id', $vehicle->id)
        ->where('completed', false)
        ->orderBy('due_date')
        ->take(5)
        ->get()
        ->map(fn($r) => [
            'id'      => $r->id,
            'titleAr' => $r->title_ar,
            'dueDate' => $r->due_date?->toDateString(),
            'dueKm'   => $r->due_km,
        ]);

    return response()->json($reminders);
});

// Get all reminders (upcoming + completed) by link_code — used by car dashboard
Route::get('/api/car/reminders/{linkCode}/all', function (string $linkCode) {
    $vehicle = \App\Models\Vehicle::where('link_code', strtoupper($linkCode))
        ->where('is_linked', true)
        ->first();
    if (!$vehicle) return response()->json([]);

    $reminders = \App\Models\Reminder::where('vehicle_id', $vehicle->id)
        ->orderBy('due_time')
        ->orderBy('due_date')
        ->get()
        ->map(fn($r) => [
            'id'      => $r->id,
            'titleAr' => $r->title_ar,
            'notes'   => $r->notes,
            'dueDate' => $r->due_date?->toDateString(),
            'dueTime' => $r->due_time,
            'dueKm'   => $r->due_km,
            'completed' => (bool) $r->completed,
        ]);

    return response()->json($reminders);
});

Route::get('/car/dashboard', function () {
    $vehicle = [
        'brand' => 'Toyota', 'model' => 'Land Cruiser', 'year' => 2022,
        'color' => '#1A1A1A', 'plateNumber' => 'أ ب ج 1234', 'currentKm' => 84320,
    ];
    return Inertia::render('Car/Dashboard', ['vehicle' => $vehicle, 'userName' => 'أحمد']);
});

Route::post('/api/vehicle/odometer', function () {
    $km = (int) request('km');
    if ($km < 0 || $km > 9_999_999) return response()->json(['error' => 'invalid'], 422);
    return response()->json(['km' => $km, 'updated_at' => now()->toTimeString()]);
});


Route::get('/api/geo', function () {
    $ip  = request()->ip();
    $res = Http::timeout(5)->get("http://ip-api.com/json/{$ip}?fields=lat,lon,city,country,countryCode,status");
    if ($res->successful()) {
        $d = $res->json();
        if (($d['status'] ?? '') === 'success') {
            return response()->json([
                'latitude' => $d['lat'] ?? null, 'longitude' => $d['lon'] ?? null,
                'city' => $d['city'] ?? null, 'country' => $d['country'] ?? null,
                'country_code' => $d['countryCode'] ?? null,
            ]);
        }
    }
    $res2 = Http::timeout(5)->get("https://ipwho.is/{$ip}");
    if ($res2->successful()) {
        $d = $res2->json();
        if ($d['success'] ?? false) {
            return response()->json([
                'latitude' => $d['latitude'] ?? null, 'longitude' => $d['longitude'] ?? null,
                'city' => $d['city'] ?? null, 'country' => $d['country'] ?? null,
                'country_code' => $d['country_code'] ?? null,
            ]);
        }
    }
    return response()->json(['error' => 'geo failed'], 502);
});
