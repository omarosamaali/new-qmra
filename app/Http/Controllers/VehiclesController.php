<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Services\CloudSync;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class VehiclesController extends Controller
{
    private function userId(): int
    {
        return Auth::check() ? Auth::id() : 1;
    }

    public function index()
    {
        $userId   = $this->userId();
        $vehicles = Vehicle::where('user_id', $userId)->get()->map(fn($v) => [
            'id'                 => (int) $v->id,
            'nameAr'             => $v->name_ar,
            'nameEn'             => $v->name_en,
            'brand'              => $v->brand,
            'type'               => $v->type,
            'plateNumber'        => $v->plate_number,
            'km'                 => (int) $v->km,
            'unit'               => $v->unit ?? 'km',
            'color'              => $v->color,
            'year'               => (int) $v->year,
            'registrationExpiry' => $v->registration_expiry?->toDateString(),
            'insuranceExpiry'    => $v->insurance_expiry?->toDateString(),
            'notes'              => $v->notes,
        ]);
        return \Inertia\Inertia::render('Phone/Vehicles', ['vehicles' => $vehicles]);
    }

    public function store(Request $request)
    {
        $userId = $this->userId();

        $request->validate([
            'plate_number' => 'required|string',
            'brand' => 'required|string',
            'year' => 'required|integer|digits:4|min:1000|max:'.((int) date('Y') + 2),
            'km' => 'required|integer|min:0',
        ], [
            'plate_number.required' => 'رقم اللوحة مطلوب.',
            'brand.required' => 'الشركة المصنّعة مطلوبة.',
            'year.required' => 'سنة الصنع مطلوبة.',
            'year.integer' => 'سنة الصنع غير صالحة.',
            'year.digits' => 'سنة الصنع يجب أن تكون 4 أرقام.',
            'km.required' => 'قيمة العداد مطلوبة.',
            'km.integer' => 'العداد يجب أن يكون رقماً صحيحاً.',
            'km.min' => 'العداد لا يمكن أن يكون سالباً.',
        ]);

        $vehicle = Vehicle::create([
            'user_id'               => $userId,
            'name_ar'               => $request->name_ar      ?? $request->brand,
            'name_en'               => $request->name_en      ?? $request->brand,
            'brand'                 => $request->brand,
            'plate_number'          => $request->plate_number,
            'km'                    => $request->km,
            'unit'                  => $request->unit         ?? 'km',
            'color'                 => '#800000',
            'year'                  => $request->year,
            'image'                 => null,
            'registration_expiry'   => $request->registration_expiry ?: null,
            'insurance_expiry'      => $request->insurance_expiry    ?: null,
            'notes'                 => $request->filled('notes') ? trim((string) $request->notes) : null,
        ]);

        CloudSync::pushVehicle($vehicle, 'post');

        return redirect('/');
    }

    public function update(Request $request, int $id)
    {
        $userId = $this->userId();

        $vehicle = Vehicle::where('id', $id)->where('user_id', $userId)->firstOrFail();

        $vehicle->update([
            'name_ar'               => $request->nameAr              ?? $vehicle->name_ar,
            'name_en'               => $request->nameEn              ?? $vehicle->name_en,
            'brand'                 => $request->brand               ?? $vehicle->brand,
            'type'                  => $request->type                ?? $vehicle->type,
            'plate_number'          => $request->plateNumber         ?? $vehicle->plate_number,
            'km'                    => $request->km                  ?? $vehicle->km,
            'unit'                  => $request->unit                ?? $vehicle->unit,
            'color'                 => $request->color               ?? $vehicle->color,
            'year'                  => $request->year                ?? $vehicle->year,
            'image'                 => $vehicle->image,
            'registration_expiry'   => $request->has('registrationExpiry') ? ($request->registrationExpiry ?: null) : $vehicle->registration_expiry,
            'insurance_expiry'      => $request->has('insuranceExpiry')    ? ($request->insuranceExpiry    ?: null) : $vehicle->insurance_expiry,
            'notes'                 => $request->has('notes')
                ? ($request->input('notes') === null || $request->input('notes') === '' ? null : trim((string) $request->input('notes')))
                : $vehicle->notes,
        ]);

        CloudSync::pushVehicle($vehicle->fresh(), 'put');

        return back();
    }

    public function destroy(int $id)
    {
        $userId  = $this->userId();
        $vehicle = Vehicle::where('id', $id)->where('user_id', $userId)->firstOrFail();
        $serverId = $vehicle->server_id;
        $vehicle->delete();
        if ($serverId) CloudSync::deleteVehicle($serverId);

        return back();
    }

    public function link(Request $request, int $id)
    {
        $userId  = $this->userId();
        $vehicle = Vehicle::where('id', $id)->where('user_id', $userId)->firstOrFail();

        $code = strtoupper(trim($request->input('code', '')));

        if (!$code || !Cache::has('car_code:' . $code)) {
            return response()->json(['error' => 'الرمز غير صحيح أو منتهي الصلاحية'], 422);
        }

        Cache::forget('car_code:' . $code);

        $vehicle->update([
            'is_linked' => true,
            'link_code' => $code,
        ]);

        return response()->json(['success' => true]);
    }

    public function unlink(int $id)
    {
        $userId  = $this->userId();
        $vehicle = Vehicle::where('id', $id)->where('user_id', $userId)->firstOrFail();

        $vehicle->update(['is_linked' => false, 'link_code' => null]);

        return response()->json(['success' => true]);
    }
}
