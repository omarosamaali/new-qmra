<?php

namespace App\Http\Controllers;

use App\Models\Record;
use App\Models\Service;
use App\Models\Vehicle;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RecordsController extends Controller
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
            'plateNumber' => $v->plate_number,
            'color'       => $v->color,
            'type'        => $v->type,
        ]);

        $services = Service::all()->map(fn($s) => [
            'id'     => $s->id,
            'nameAr' => $s->name_ar,
            'nameEn' => $s->name_en,
            'icon'   => $s->icon,
        ]);

        $vehicleIds = $vehicles->pluck('id');
        $records    = Record::whereIn('vehicle_id', $vehicleIds)
            ->orderByDesc('date')
            ->get()
            ->map(fn($r) => [
                'id'        => $r->id,
                'vehicleId' => $r->vehicle_id,
                'serviceId' => $r->service_id,
                'date'      => $r->date?->toDateString(),
                'km'        => $r->km,
                'cost'      => $r->cost,
                'provider'  => $r->provider,
                'notes'     => $r->notes,
            ]);

        return Inertia::render('Phone/Records', [
            'vehicles'         => $vehicles,
            'services'         => $services,
            'records'          => $records,
            'defaultServiceId' => request('serviceId'),
            'defaultVehicleId' => request('vehicleId'),
        ]);
    }
}
