<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\Reminder;
use App\Models\Vehicle;
use App\Models\VehicleService;
use App\Models\Warranty;
use Illuminate\Http\Request;

class UserDataController extends Controller
{
    // ── Pull all user data ────────────────────────────────────────────────────

    public function pull(Request $request)
    {
        $user       = $request->user();
        $vehicles   = Vehicle::where('user_id', $user->id)->get();
        $vehicleIds = $vehicles->pluck('id');

        return response()->json([
            'vehicles'         => $vehicles,
            'notes'            => Note::where('user_id', $user->id)->get(),
            'reminders'        => Reminder::where('user_id', $user->id)->get(),
            'vehicle_services' => VehicleService::whereIn('vehicle_id', $vehicleIds)->get(),
            'warranties'       => Warranty::whereIn('vehicle_id', $vehicleIds)->get(),
        ]);
    }

    // ── Vehicles ──────────────────────────────────────────────────────────────

    public function storeVehicle(Request $request)
    {
        $user    = $request->user();
        $vehicle = Vehicle::create([
            'user_id'             => $user->id,
            'name_ar'             => $request->name_ar       ?? $request->brand ?? '',
            'name_en'             => $request->name_en       ?? $request->brand ?? '',
            'brand'               => $request->brand         ?? '',
            'plate_number'        => $request->plate_number  ?? '',
            'km'                  => (int) ($request->km     ?? 0),
            'unit'                => $request->unit          ?? 'km',
            'year'                => (int) ($request->year   ?? date('Y')),
            'color'               => '#800000',
            'registration_expiry' => $request->registration_expiry ?: null,
            'insurance_expiry'    => $request->insurance_expiry    ?: null,
            'notes'               => $request->filled('notes') ? trim((string) $request->notes) : null,
        ]);

        return response()->json(['vehicle' => $vehicle]);
    }

    public function updateVehicle(Request $request, int $id)
    {
        $vehicle = Vehicle::where('user_id', $request->user()->id)->findOrFail($id);
        $vehicle->update([
            'name_ar'             => $request->name_ar             ?? $vehicle->name_ar,
            'name_en'             => $request->name_en             ?? $vehicle->name_en,
            'brand'               => $request->brand               ?? $vehicle->brand,
            'plate_number'        => $request->plate_number        ?? $vehicle->plate_number,
            'km'                  => $request->has('km')  ? (int) $request->km  : $vehicle->km,
            'unit'                => $request->unit                ?? $vehicle->unit,
            'year'                => $request->has('year') ? (int) $request->year : $vehicle->year,
            'registration_expiry' => $request->has('registration_expiry') ? ($request->registration_expiry ?: null) : $vehicle->registration_expiry,
            'insurance_expiry'    => $request->has('insurance_expiry')    ? ($request->insurance_expiry    ?: null) : $vehicle->insurance_expiry,
            'notes'               => $request->has('notes')
                ? ($request->input('notes') === null || $request->input('notes') === '' ? null : trim((string) $request->input('notes')))
                : $vehicle->notes,
        ]);
        return response()->json(['vehicle' => $vehicle->fresh()]);
    }

    public function destroyVehicle(Request $request, int $id)
    {
        Vehicle::where('user_id', $request->user()->id)->findOrFail($id)->delete();
        return response()->json(['message' => 'deleted']);
    }

    // ── Notes ─────────────────────────────────────────────────────────────────

    public function storeNote(Request $request)
    {
        $note = Note::create([
            'user_id'       => $request->user()->id,
            'title'         => $request->title        ?? '',
            'content'       => $request->content      ?: null,
            'color_idx'     => (int) ($request->color_idx ?? 0),
            'reminder_date' => $request->reminder_date ?: null,
            'reminder_time' => $request->reminder_time ?: null,
        ]);
        return response()->json(['note' => $note]);
    }

    public function updateNote(Request $request, int $id)
    {
        $note = Note::where('user_id', $request->user()->id)->findOrFail($id);
        $note->update([
            'title'         => $request->title         ?? $note->title,
            'content'       => $request->has('content')       ? ($request->content       ?: null) : $note->content,
            'color_idx'     => $request->has('color_idx')     ? (int) $request->color_idx          : $note->color_idx,
            'reminder_date' => $request->has('reminder_date') ? ($request->reminder_date ?: null)  : $note->reminder_date,
            'reminder_time' => $request->has('reminder_time') ? ($request->reminder_time ?: null)  : $note->reminder_time,
        ]);
        return response()->json(['note' => $note->fresh()]);
    }

    public function destroyNote(Request $request, int $id)
    {
        Note::where('user_id', $request->user()->id)->findOrFail($id)->delete();
        return response()->json(['message' => 'deleted']);
    }
}
