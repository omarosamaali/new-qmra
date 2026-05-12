<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class VehiclesController extends Controller
{
    private function userId(): int
    {
        return Auth::check() ? Auth::id() : 1;
    }

    public function store(Request $request)
    {
        $userId = $this->userId();

        $request->validate([
            'plate_number' => 'required|string',
            'brand' => 'required|string',
            'year' => 'required|integer|min:1990|max:'.((int) date('Y') + 1),
            'km' => 'required|integer|min:0',
        ], [
            'plate_number.required' => 'رقم اللوحة مطلوب.',
            'brand.required' => 'الشركة المصنّعة مطلوبة.',
            'year.required' => 'سنة الصنع مطلوبة.',
            'year.integer' => 'سنة الصنع غير صالحة.',
            'km.required' => 'قيمة العداد مطلوبة.',
            'km.integer' => 'العداد يجب أن يكون رقماً صحيحاً.',
            'km.min' => 'العداد لا يمكن أن يكون سالباً.',
        ]);

        Vehicle::create([
            'user_id'               => $userId,
            'name_ar'               => $request->name_ar      ?? $request->brand,
            'name_en'               => $request->name_en      ?? $request->brand,
            'brand'                 => $request->brand,
            'type'                  => $request->type         ?? 'sedan',
            'plate_number'          => $request->plate_number,
            'km'                    => $request->km,
            'color'                 => $request->color        ?? '#1A1A1A',
            'year'                  => $request->year,
            'image'                 => null,
            'registration_expiry'   => $request->registration_expiry ?: null,
            'insurance_expiry'      => $request->insurance_expiry    ?: null,
        ]);

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
        ]);

        return back();
    }

    public function destroy(int $id)
    {
        $userId = $this->userId();

        $vehicle = Vehicle::where('id', $id)->where('user_id', $userId)->firstOrFail();
        $vehicle->delete();

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
