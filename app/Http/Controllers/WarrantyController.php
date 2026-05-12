<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\Warranty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WarrantyController extends Controller
{
    private function userId(): int
    {
        return Auth::check() ? Auth::id() : 1;
    }

    public function index()
    {
        $userId = $this->userId();

        $vehicles = Vehicle::where('user_id', $userId)->get()->map(fn($v) => [
            'id'          => $v->id,
            'nameAr'      => $v->name_ar,
            'nameEn'      => $v->name_en,
            'brand'       => $v->brand,
            'type'        => $v->type,
            'plateNumber' => $v->plate_number,
            'color'       => $v->color,
        ]);

        $vehicleIds = $vehicles->pluck('id');
        $warranties = Warranty::whereIn('vehicle_id', $vehicleIds)->get()->map(fn($w) => [
            'id'         => $w->id,
            'vehicleId'  => $w->vehicle_id,
            'titleAr'    => $w->title_ar,
            'titleEn'    => $w->title_en,
            'icon'       => $w->icon,
            'expiryDate' => $w->expiry_date?->toDateString(),
            'provider'   => $w->provider,
            'notes'      => $w->notes,
        ]);

        return Inertia::render('Phone/Warranty', [
            'vehicles'         => $vehicles,
            'warranties'       => $warranties,
            'defaultVehicleId' => request('vehicleId'),
        ]);
    }

    public function store(Request $request)
    {
        $userId = $this->userId();

        $request->validate([
            'vehicle_id'  => 'required|exists:vehicles,id',
            'expiry_date' => 'nullable|date',
        ]);

        Vehicle::where('id', $request->vehicle_id)->where('user_id', $userId)->firstOrFail();

        $titleAr = $request->input('titleAr') ?: ($request->input('titleEn') ?: 'ضمان');
        $titleEn = $request->input('titleEn') ?: ($request->input('titleAr') ?: 'Warranty');

        Warranty::create([
            'user_id'    => $userId,
            'vehicle_id' => $request->input('vehicle_id'),
            'title_ar'   => $titleAr,
            'title_en'   => $titleEn,
            'icon'       => $request->input('icon', '🛡️'),
            'provider'   => $request->input('provider'),
            'notes'      => $request->input('notes'),
        ]);

        return back();
    }

    public function update(Request $request, int $id)
    {
        $userId = $this->userId();
        $w = Warranty::findOrFail($id);
        Vehicle::where('id', $w->vehicle_id)->where('user_id', $userId)->firstOrFail();

        $w->update([
            'expiry_date' => $request->input('expiry_date') ?: $w->expiry_date,
            'provider'    => $request->has('provider') ? ($request->input('provider') ?: null) : $w->provider,
            'notes'       => $request->has('notes')    ? ($request->input('notes')    ?: null) : $w->notes,
        ]);

        return back();
    }

    public function destroy(int $id)
    {
        $userId = $this->userId();
        $w = Warranty::findOrFail($id);
        Vehicle::where('id', $w->vehicle_id)->where('user_id', $userId)->firstOrFail();
        $w->delete();
        return back();
    }
}
