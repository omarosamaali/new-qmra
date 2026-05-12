<?php

namespace App\Services;

use App\Models\Note;
use App\Models\Reminder;
use App\Models\Vehicle;
use App\Models\VehicleService;
use App\Models\Warranty;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CloudSync
{
    // ── Config ────────────────────────────────────────────────────────────────

    public static function isEnabled(): bool
    {
        $url = env('APP_BACKEND_URL', '');
        return !empty($url);
    }

    public static function baseUrl(): string
    {
        return rtrim(env('APP_BACKEND_URL', ''), '/') . '/api';
    }

    public static function token(): ?string
    {
        try {
            return session('api_token');
        } catch (\Exception $e) {
            return null;
        }
    }

    private static function http()
    {
        return Http::timeout(10)->withToken(self::token());
    }

    private static function userId(): int
    {
        return Auth::check() ? Auth::id() : 1;
    }

    // ── Pull all data from server → store locally ─────────────────────────────

    public static function pull(): bool
    {
        if (!self::isEnabled() || !self::token()) return false;

        try {
            $res = self::http()->get(self::baseUrl() . '/user/data');
            if (!$res->successful()) return false;

            $data   = $res->json();
            $userId = self::userId();

            self::upsertVehicles($data['vehicles']         ?? [], $userId);
            self::upsertNotes($data['notes']               ?? [], $userId);
            self::upsertReminders($data['reminders']       ?? [], $userId);
            self::upsertVehicleServices($data['vehicle_services'] ?? [], $userId);
            self::upsertWarranties($data['warranties']     ?? [], $userId);

            return true;
        } catch (\Exception $e) {
            Log::warning('CloudSync::pull failed: ' . $e->getMessage());
            return false;
        }
    }

    // ── Push pending (offline queue) ──────────────────────────────────────────

    public static function flushQueue(): void
    {
        if (!self::isEnabled() || !self::token()) return;

        $userId = self::userId();

        // Push vehicles without server_id (created offline)
        Vehicle::where('user_id', $userId)->whereNull('server_id')->each(function ($v) {
            self::pushVehicle($v, 'post');
        });

        Note::where('user_id', $userId)->whereNull('server_id')->each(function ($n) {
            self::pushNote($n, 'post');
        });
    }

    // ── Vehicles ──────────────────────────────────────────────────────────────

    public static function pushVehicle(Vehicle $vehicle, string $method = 'post'): void
    {
        if (!self::isEnabled() || !self::token()) return;

        $data = [
            'name_ar'             => $vehicle->name_ar,
            'name_en'             => $vehicle->name_en,
            'brand'               => $vehicle->brand,
            'plate_number'        => $vehicle->plate_number,
            'km'                  => (int) $vehicle->km,
            'unit'                => $vehicle->unit ?? 'km',
            'year'                => (int) $vehicle->year,
            'registration_expiry' => $vehicle->registration_expiry?->toDateString(),
            'insurance_expiry'    => $vehicle->insurance_expiry?->toDateString(),
        ];

        try {
            if ($method === 'post') {
                $res = self::http()->post(self::baseUrl() . '/user/vehicles', $data);
                if ($res->successful()) {
                    $serverId = $res->json('vehicle.id');
                    if ($serverId) $vehicle->updateQuietly(['server_id' => $serverId]);
                }
            } elseif ($method === 'put' && $vehicle->server_id) {
                self::http()->put(self::baseUrl() . '/user/vehicles/' . $vehicle->server_id, $data);
            }
        } catch (\Exception $e) {
            Log::warning('CloudSync::pushVehicle failed: ' . $e->getMessage());
        }
    }

    public static function deleteVehicle(int $serverId): void
    {
        if (!self::isEnabled() || !self::token()) return;
        try {
            self::http()->delete(self::baseUrl() . '/user/vehicles/' . $serverId);
        } catch (\Exception $e) {
            Log::warning('CloudSync::deleteVehicle failed: ' . $e->getMessage());
        }
    }

    // ── Notes ─────────────────────────────────────────────────────────────────

    public static function pushNote(Note $note, string $method = 'post'): void
    {
        if (!self::isEnabled() || !self::token()) return;

        $data = [
            'title'         => $note->title,
            'content'       => $note->content,
            'color_idx'     => $note->color_idx,
            'reminder_date' => $note->reminder_date?->toDateString(),
            'reminder_time' => $note->reminder_time,
        ];

        try {
            if ($method === 'post') {
                $res = self::http()->post(self::baseUrl() . '/user/notes', $data);
                if ($res->successful()) {
                    $serverId = $res->json('note.id');
                    if ($serverId) $note->updateQuietly(['server_id' => $serverId]);
                }
            } elseif ($method === 'put' && $note->server_id) {
                self::http()->put(self::baseUrl() . '/user/notes/' . $note->server_id, $data);
            }
        } catch (\Exception $e) {
            Log::warning('CloudSync::pushNote failed: ' . $e->getMessage());
        }
    }

    public static function deleteNote(int $serverId): void
    {
        if (!self::isEnabled() || !self::token()) return;
        try {
            self::http()->delete(self::baseUrl() . '/user/notes/' . $serverId);
        } catch (\Exception $e) {
            Log::warning('CloudSync::deleteNote failed: ' . $e->getMessage());
        }
    }

    // ── Upsert helpers ────────────────────────────────────────────────────────

    private static function upsertVehicles(array $vehicles, int $userId): void
    {
        $serverIds = array_column($vehicles, 'id');

        foreach ($vehicles as $v) {
            Vehicle::updateOrCreate(
                ['server_id' => $v['id'], 'user_id' => $userId],
                [
                    'name_ar'             => $v['name_ar']             ?? '',
                    'name_en'             => $v['name_en']             ?? '',
                    'brand'               => $v['brand']               ?? '',
                    'plate_number'        => $v['plate_number']        ?? '',
                    'km'                  => (int) ($v['km']           ?? 0),
                    'unit'                => $v['unit']                ?? 'km',
                    'year'                => (int) ($v['year']         ?? date('Y')),
                    'color'               => $v['color']               ?? '#800000',
                    'registration_expiry' => $v['registration_expiry'] ?? null,
                    'insurance_expiry'    => $v['insurance_expiry']    ?? null,
                    'is_linked'           => (bool) ($v['is_linked']   ?? false),
                    'link_code'           => $v['link_code']           ?? null,
                ]
            );
        }

        if (!empty($serverIds)) {
            Vehicle::where('user_id', $userId)
                   ->whereNotNull('server_id')
                   ->whereNotIn('server_id', $serverIds)
                   ->delete();
        }
    }

    private static function upsertNotes(array $notes, int $userId): void
    {
        $serverIds = array_column($notes, 'id');

        foreach ($notes as $n) {
            Note::updateOrCreate(
                ['server_id' => $n['id'], 'user_id' => $userId],
                [
                    'title'         => $n['title']         ?? '',
                    'content'       => $n['content']       ?? null,
                    'color_idx'     => (int) ($n['color_idx'] ?? 0),
                    'reminder_date' => $n['reminder_date'] ?? null,
                    'reminder_time' => $n['reminder_time'] ?? null,
                ]
            );
        }

        if (!empty($serverIds)) {
            Note::where('user_id', $userId)
                ->whereNotNull('server_id')
                ->whereNotIn('server_id', $serverIds)
                ->delete();
        }
    }

    private static function upsertReminders(array $reminders, int $userId): void
    {
        foreach ($reminders as $r) {
            Reminder::updateOrCreate(
                ['server_id' => $r['id'], 'user_id' => $userId],
                [
                    'title_ar'  => $r['title_ar']  ?? '',
                    'notes'     => $r['notes']     ?? null,
                    'due_date'  => $r['due_date']  ?? null,
                    'due_time'  => $r['due_time']  ?? null,
                    'due_km'    => $r['due_km']    ?? null,
                    'completed' => (bool) ($r['completed'] ?? false),
                ]
            );
        }
    }

    private static function upsertVehicleServices(array $services, int $userId): void
    {
        foreach ($services as $s) {
            $vehicle = Vehicle::where('server_id', $s['vehicle_id'])->where('user_id', $userId)->first();
            if (!$vehicle) continue;

            VehicleService::updateOrCreate(
                ['server_id' => $s['id'], 'vehicle_id' => $vehicle->id],
                [
                    'service_id'    => $s['service_id']    ?? null,
                    'interval_km'   => $s['interval_km']   ?? null,
                    'interval_days' => $s['interval_days'] ?? null,
                    'cost'          => $s['cost']          ?? null,
                    'notes'         => $s['notes']         ?? null,
                ]
            );
        }
    }

    private static function upsertWarranties(array $warranties, int $userId): void
    {
        foreach ($warranties as $w) {
            $vehicle = Vehicle::where('server_id', $w['vehicle_id'])->where('user_id', $userId)->first();
            if (!$vehicle) continue;

            Warranty::updateOrCreate(
                ['server_id' => $w['id'], 'vehicle_id' => $vehicle->id],
                [
                    'user_id'     => $userId,
                    'title_ar'    => $w['title_ar']    ?? '',
                    'title_en'    => $w['title_en']    ?? '',
                    'icon'        => $w['icon']        ?? null,
                    'expiry_date' => $w['expiry_date'] ?? null,
                    'provider'    => $w['provider']    ?? null,
                    'notes'       => $w['notes']       ?? null,
                ]
            );
        }
    }
}
