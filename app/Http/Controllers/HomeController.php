<?php

namespace App\Http\Controllers;

use App\Models\Record;
use App\Models\Reminder;
use App\Models\Vehicle;
use App\Models\VehicleService;
use App\Models\Warranty;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        // For now use user id=1 (demo). Replace with Auth::id() once auth middleware is applied.
        $userId = Auth::check() ? Auth::id() : 1;

        $vehicles = Vehicle::where('user_id', $userId)->get()
            ->map(fn($v) => [
                'id'                   => $v->id,
                'nameAr'               => $v->name_ar,
                'nameEn'               => $v->name_en,
                'brand'                => $v->brand,
                'type'                 => $v->type,
                'plateNumber'          => $v->plate_number,
                'km'                   => $v->km,
                'color'                => $v->color,
                'year'                 => $v->year,
                'image'                => $v->image,
                'isLinked'             => (bool) $v->is_linked,
                'linkCode'             => $v->link_code,
                'registrationExpiry'   => $v->registration_expiry?->toDateString(),
                'insuranceExpiry'      => $v->insurance_expiry?->toDateString(),
            ]);

        $services = collect([
            ['id' =>  1, 'nameAr' => 'تغيير زيت المحرك',     'nameEn' => 'Oil Change',         'icon' => '🛢️'],
            ['id' =>  2, 'nameAr' => 'فلتر الهواء',           'nameEn' => 'Air Filter',         'icon' => '💨'],
            ['id' =>  3, 'nameAr' => 'فلتر الوقود',           'nameEn' => 'Fuel Filter',        'icon' => '⛽'],
            ['id' =>  4, 'nameAr' => 'فلتر الكابينة',         'nameEn' => 'Cabin Filter',       'icon' => '🌬️'],
            ['id' =>  5, 'nameAr' => 'البواجي',               'nameEn' => 'Spark Plugs',        'icon' => '⚡'],
            ['id' =>  6, 'nameAr' => 'فحص الفرامل',           'nameEn' => 'Brake Inspection',  'icon' => '🛑'],
            ['id' =>  7, 'nameAr' => 'تبديل الإطارات',        'nameEn' => 'Tire Rotation',      'icon' => '🔄'],
            ['id' =>  8, 'nameAr' => 'ضبط الإطارات',          'nameEn' => 'Wheel Alignment',   'icon' => '🎯'],
            ['id' =>  9, 'nameAr' => 'موازنة الإطارات',       'nameEn' => 'Wheel Balancing',   'icon' => '⚖️'],
            ['id' => 10, 'nameAr' => 'سائل التبريد',          'nameEn' => 'Coolant Flush',      'icon' => '🌡️'],
            ['id' => 11, 'nameAr' => 'سائل الفرامل',          'nameEn' => 'Brake Fluid',        'icon' => '💧'],
            ['id' => 12, 'nameAr' => 'سائل ناقل الحركة',      'nameEn' => 'Transmission Fluid','icon' => '🔧'],
            ['id' => 13, 'nameAr' => 'بطارية السيارة',        'nameEn' => 'Battery Check',      'icon' => '🔋'],
            ['id' => 14, 'nameAr' => 'حزام التوقيت',          'nameEn' => 'Timing Belt',        'icon' => '⚙️'],
            ['id' => 15, 'nameAr' => 'حزام المروحة',          'nameEn' => 'Drive Belt',         'icon' => '🔗'],
            ['id' => 16, 'nameAr' => 'فحص التكييف',           'nameEn' => 'AC Service',         'icon' => '❄️'],
            ['id' => 17, 'nameAr' => 'شمعات التوهج',          'nameEn' => 'Glow Plugs',         'icon' => '🕯️'],
            ['id' => 18, 'nameAr' => 'فحص شامل',              'nameEn' => 'Full Inspection',   'icon' => '🔍'],
            ['id' => 19, 'nameAr' => 'تجديد مسح الزجاج',     'nameEn' => 'Wiper Blades',       'icon' => '🌧️'],
            ['id' => 20, 'nameAr' => 'فحص الإضاءة',           'nameEn' => 'Lights Check',       'icon' => '💡'],
        ]);

        $reminders = Reminder::where('user_id', $userId)->get()->map(fn($r) => [
            'id'        => $r->id,
            'vehicleId' => $r->vehicle_id,
            'serviceId' => $r->service_id,
            'titleAr'   => $r->title_ar,
            'dueDate'   => $r->due_date?->toDateString(),
            'dueKm'     => $r->due_km,
            'completed' => $r->completed,
        ]);

        $records = Record::where('user_id', $userId)
            ->orderByDesc('date')
            ->get()
            ->map(fn($r) => [
                'id'        => $r->id,
                'vehicleId' => $r->vehicle_id,
                'serviceId' => $r->service_id,
                'date'      => $r->date->toDateString(),
                'km'        => $r->km,
                'cost'      => $r->cost,
                'notes'     => $r->notes,
                'provider'  => $r->provider,
            ]);

        $warranties = Warranty::where('user_id', $userId)->get()->map(fn($w) => [
            'id'         => $w->id,
            'vehicleId'  => $w->vehicle_id,
            'titleAr'    => $w->title_ar,
            'titleEn'    => $w->title_en,
            'icon'       => $w->icon,
            'expiryDate' => $w->expiry_date?->toDateString(),
            'provider'   => $w->provider,
            'notes'      => $w->notes,
        ]);

        $vehicleIds = $vehicles->pluck('id');
        $vehicleServicesCount = VehicleService::whereIn('vehicle_id', $vehicleIds)->count();

        $vehicleServices = VehicleService::whereIn('vehicle_id', $vehicleIds)->get()->map(fn($vs) => [
            'vehicleId' => $vs->vehicle_id,
            'serviceId' => $vs->service_id,
        ]);

        $subscription = request()->session()->get('subscription', [
            'cars_count'   => 1,
            'addons_count' => 0,
        ]);

        return Inertia::render('Home', compact('vehicles','services','reminders','records','warranties','vehicleServicesCount','vehicleServices','subscription'));
    }
}
