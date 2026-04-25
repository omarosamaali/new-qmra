<?php

namespace App\Http\Controllers;

use App\Models\Reminder;
use App\Models\Vehicle;
use App\Models\VehicleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ServicesController extends Controller
{
    private function userId(): int
    {
        return Auth::check() ? Auth::id() : 1;
    }

    public function index(Request $request)
    {
        $userId = $this->userId();

        $vehicles = Vehicle::where('user_id', $userId)->get()->map(fn($v) => [
            'id'          => $v->id,
            'nameAr'      => $v->name_ar,
            'nameEn'      => $v->name_en,
            'brand'       => $v->brand,
            'type'        => $v->type,
            'plateNumber' => $v->plate_number,
            'km'          => $v->km,
            'color'       => $v->color,
            'year'        => $v->year,
        ]);

        $services = collect([
            ['id' =>  1, 'nameAr' => 'تغيير زيت المحرك',        'nameEn' => 'Oil Change',              'icon' => '🛢️'],
            ['id' =>  2, 'nameAr' => 'فلتر الهواء',              'nameEn' => 'Air Filter',              'icon' => '💨'],
            ['id' =>  3, 'nameAr' => 'فلتر الوقود',              'nameEn' => 'Fuel Filter',             'icon' => '⛽'],
            ['id' =>  4, 'nameAr' => 'فلتر الكابينة',            'nameEn' => 'Cabin Filter',            'icon' => '🌬️'],
            ['id' =>  5, 'nameAr' => 'البواجي',                  'nameEn' => 'Spark Plugs',             'icon' => '⚡'],
            ['id' =>  6, 'nameAr' => 'فحص الفرامل',              'nameEn' => 'Brake Inspection',       'icon' => '🛑'],
            ['id' =>  7, 'nameAr' => 'تبديل الإطارات',           'nameEn' => 'Tire Rotation',           'icon' => '🔄'],
            ['id' =>  8, 'nameAr' => 'ضبط الإطارات',             'nameEn' => 'Wheel Alignment',        'icon' => '🎯'],
            ['id' =>  9, 'nameAr' => 'موازنة الإطارات',          'nameEn' => 'Wheel Balancing',        'icon' => '⚖️'],
            ['id' => 10, 'nameAr' => 'سائل التبريد',             'nameEn' => 'Coolant Flush',           'icon' => '🌡️'],
            ['id' => 11, 'nameAr' => 'سائل الفرامل',             'nameEn' => 'Brake Fluid',             'icon' => '💧'],
            ['id' => 12, 'nameAr' => 'سائل ناقل الحركة',         'nameEn' => 'Transmission Fluid',     'icon' => '🔧'],
            ['id' => 13, 'nameAr' => 'بطارية السيارة',           'nameEn' => 'Battery Check',           'icon' => '🔋'],
            ['id' => 14, 'nameAr' => 'حزام التوقيت',             'nameEn' => 'Timing Belt',             'icon' => '⚙️'],
            ['id' => 15, 'nameAr' => 'حزام المروحة',             'nameEn' => 'Drive Belt',              'icon' => '🔗'],
            ['id' => 16, 'nameAr' => 'فحص التكييف',              'nameEn' => 'AC Service',              'icon' => '❄️'],
            ['id' => 17, 'nameAr' => 'شمعات التوهج',             'nameEn' => 'Glow Plugs',              'icon' => '🕯️'],
            ['id' => 18, 'nameAr' => 'فحص شامل',                 'nameEn' => 'Full Inspection',        'icon' => '🔍'],
            ['id' => 19, 'nameAr' => 'تجديد مسح الزجاج',        'nameEn' => 'Wiper Blades',            'icon' => '🌧️'],
            ['id' => 20, 'nameAr' => 'فحص الإضاءة',              'nameEn' => 'Lights Check',            'icon' => '💡'],
        ]);

        $vehicleIds = $vehicles->pluck('id');
        $vehicleServices = VehicleService::whereIn('vehicle_id', $vehicleIds)->get()->map(fn($vs) => [
            'id'          => $vs->id,
            'vehicleId'   => $vs->vehicle_id,
            'serviceId'   => $vs->service_id,
            'intervalKm'  => $vs->interval_km,
            'intervalDays'=> $vs->interval_days,
            'cost'        => $vs->cost,
            'notes'       => $vs->notes,
        ]);

        return Inertia::render('Phone/Services', [
            'vehicles'        => $vehicles,
            'services'        => $services,
            'vehicleServices' => $vehicleServices,
            'defaultVehicleId'=> $request->query('vehicleId'),
        ]);
    }

    public function store(Request $request)
    {
        $userId = $this->userId();

        $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'service_id' => 'required|integer',
        ]);

        $vehicle = Vehicle::where('id', $request->vehicle_id)->where('user_id', $userId)->firstOrFail();

        $staticServices = [
            1 => 'تغيير زيت المحرك', 2 => 'فلتر الهواء',       3 => 'فلتر الوقود',
            4 => 'فلتر الكابينة',    5 => 'البواجي',            6 => 'فحص الفرامل',
            7 => 'تبديل الإطارات',  8 => 'ضبط الإطارات',       9 => 'موازنة الإطارات',
           10 => 'سائل التبريد',   11 => 'سائل الفرامل',      12 => 'سائل ناقل الحركة',
           13 => 'بطارية السيارة', 14 => 'حزام التوقيت',      15 => 'حزام المروحة',
           16 => 'فحص التكييف',   17 => 'شمعات التوهج',      18 => 'فحص شامل',
           19 => 'تجديد مسح الزجاج', 20 => 'فحص الإضاءة',
        ];
        $serviceNameAr = $staticServices[$request->service_id] ?? 'خدمة';

        $vs = VehicleService::create([
            'vehicle_id'   => $request->vehicle_id,
            'service_id'   => $request->service_id,
            'interval_km'  => $request->interval_km  ?: null,
            'interval_days'=> $request->interval_days ?: null,
            'cost'         => $request->cost          ?: null,
            'notes'        => $request->notes         ?: null,
        ]);

        // إنشاء تنبيه تلقائي
        $dueDate = $request->interval_days
                    ? now()->addDays((int) $request->interval_days)->toDateString()
                    : null;
        $dueKm   = ($request->interval_km && $vehicle->km)
                    ? $vehicle->km + (int) $request->interval_km
                    : null;

        if ($dueDate || $dueKm) {
            Reminder::create([
                'user_id'    => $userId,
                'vehicle_id' => $vs->vehicle_id,
                'service_id' => $vs->service_id,
                'title_ar'   => $serviceNameAr,
                'due_date'   => $dueDate,
                'due_km'     => $dueKm,
                'completed'  => false,
            ]);
        }

        return back();
    }

    public function destroy(int $id)
    {
        $userId = $this->userId();

        $vs = VehicleService::findOrFail($id);
        Vehicle::where('id', $vs->vehicle_id)->where('user_id', $userId)->firstOrFail();
        $vs->delete();

        return back();
    }
}
