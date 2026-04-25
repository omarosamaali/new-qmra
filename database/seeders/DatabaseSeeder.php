<?php

namespace Database\Seeders;

use App\Models\Record;
use App\Models\Reminder;
use App\Models\Service;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\Warranty;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Demo user ─────────────────────────────────────────────────────────
        $user = User::firstOrCreate(
            ['email' => 'ahmed@qumra.app'],
            ['name' => 'أحمد محمد', 'password' => Hash::make('password')]
        );

        // ── Services (global) ─────────────────────────────────────────────────
        $svc = [];
        foreach ([
            // ── صيانة المحرك
            ['name_ar' => 'تغيير الزيت',           'name_en' => 'Oil Change',              'icon' => '🛢️'],
            ['name_ar' => 'فلتر الزيت',             'name_en' => 'Oil Filter',              'icon' => '🔩'],
            ['name_ar' => 'فلتر الهواء',            'name_en' => 'Air Filter',              'icon' => '💨'],
            ['name_ar' => 'فلتر الوقود',            'name_en' => 'Fuel Filter',             'icon' => '⛽'],
            ['name_ar' => 'فلتر الكابين',           'name_en' => 'Cabin Filter',            'icon' => '🌬️'],
            ['name_ar' => 'شمعات الإشعال',          'name_en' => 'Spark Plugs',             'icon' => '⚡'],
            ['name_ar' => 'شمعات التوهج',           'name_en' => 'Glow Plugs',              'icon' => '🕯️'],
            ['name_ar' => 'حزام التوقيت',           'name_en' => 'Timing Belt',             'icon' => '🔗'],
            ['name_ar' => 'سير المحرك',             'name_en' => 'Serpentine Belt',         'icon' => '〰️'],
            ['name_ar' => 'مضخة المياه',            'name_en' => 'Water Pump',              'icon' => '💧'],
            // ── سوائل
            ['name_ar' => 'سائل التبريد',           'name_en' => 'Coolant',                 'icon' => '🌡️'],
            ['name_ar' => 'سائل الفرامل',           'name_en' => 'Brake Fluid',             'icon' => '🛑'],
            ['name_ar' => 'سائل الدركسيون',         'name_en' => 'Power Steering Fluid',    'icon' => '🔄'],
            ['name_ar' => 'سائل ناقل الحركة',       'name_en' => 'Transmission Fluid',      'icon' => '⚙️'],
            ['name_ar' => 'زيت التفاضلي الأمامي',   'name_en' => 'Front Differential Oil',  'icon' => '🔧'],
            ['name_ar' => 'زيت التفاضلي الخلفي',    'name_en' => 'Rear Differential Oil',   'icon' => '🔧'],
            ['name_ar' => 'سائل نافورة الزجاج',     'name_en' => 'Washer Fluid',            'icon' => '🚿'],
            // ── نظام الفرامل والإطارات
            ['name_ar' => 'الفرامل الأمامية',       'name_en' => 'Front Brakes',            'icon' => '🛑'],
            ['name_ar' => 'الفرامل الخلفية',        'name_en' => 'Rear Brakes',             'icon' => '🛑'],
            ['name_ar' => 'الإطارات',               'name_en' => 'Tires',                   'icon' => '🔘'],
            ['name_ar' => 'ضبط الزوايا',            'name_en' => 'Wheel Alignment',         'icon' => '📐'],
            ['name_ar' => 'موازنة الإطارات',        'name_en' => 'Wheel Balancing',         'icon' => '⚖️'],
            ['name_ar' => 'تدوير الإطارات',         'name_en' => 'Tire Rotation',           'icon' => '🔁'],
            // ── الكهرباء والبطارية
            ['name_ar' => 'البطارية',               'name_en' => 'Battery',                 'icon' => '🔋'],
            ['name_ar' => 'الدينمو',                'name_en' => 'Alternator',              'icon' => '⚡'],
            ['name_ar' => 'فحص الكهرباء',           'name_en' => 'Electrical Check',        'icon' => '🔌'],
            ['name_ar' => 'المصابيح الأمامية',      'name_en' => 'Headlights',              'icon' => '💡'],
            ['name_ar' => 'مساحات الزجاج',          'name_en' => 'Wipers',                  'icon' => '🪟'],
            // ── التكييف والمناخ
            ['name_ar' => 'صيانة التكييف',          'name_en' => 'AC Service',              'icon' => '❄️'],
            ['name_ar' => 'شحن الفريون',            'name_en' => 'AC Recharge',             'icon' => '🌨️'],
            ['name_ar' => 'فلتر التكييف',           'name_en' => 'AC Filter',               'icon' => '🌀'],
            // ── الفحص والتشخيص
            ['name_ar' => 'فحص الكمبيوتر',         'name_en' => 'Computer Diagnostics',    'icon' => '💻'],
            ['name_ar' => 'فحص شامل',               'name_en' => 'Full Inspection',         'icon' => '🔍'],
            ['name_ar' => 'فحص ما قبل السفر',       'name_en' => 'Pre-Trip Inspection',     'icon' => '✅'],
            // ── العادم والوقود
            ['name_ar' => 'نظام العادم',            'name_en' => 'Exhaust System',          'icon' => '💨'],
            ['name_ar' => 'حساس الأكسجين',          'name_en' => 'O2 Sensor',               'icon' => '📡'],
            ['name_ar' => 'تنظيف الحاقن',           'name_en' => 'Injector Cleaning',       'icon' => '🔬'],
            // ── الهيكل والمقصورة
            ['name_ar' => 'غسيل المحرك',            'name_en' => 'Engine Wash',             'icon' => '🧹'],
            ['name_ar' => 'تلميع وحماية',           'name_en' => 'Polish & Protection',     'icon' => '✨'],
            ['name_ar' => 'عزل الحرارة',            'name_en' => 'Heat Insulation',         'icon' => '🌡️'],
            ['name_ar' => 'تغيير الزجاج',           'name_en' => 'Windshield',              'icon' => '🪟'],
        ] as $s) {
            $svc[] = Service::firstOrCreate(['name_en' => $s['name_en']], $s);
        }

        // ── Vehicles ──────────────────────────────────────────────────────────
        $v1 = Vehicle::firstOrCreate(['plate_number' => 'A B C 1234', 'user_id' => $user->id], [
            'user_id' => $user->id, 'name_ar' => 'كامري', 'name_en' => 'Camry',
            'brand' => 'Toyota', 'type' => 'sedan', 'km' => 85000,
            'color' => '#800000', 'year' => 2021,
        ]);
        $v2 = Vehicle::firstOrCreate(['plate_number' => 'D E F 5678', 'user_id' => $user->id], [
            'user_id' => $user->id, 'name_ar' => 'لاند كروزر', 'name_en' => 'Land Cruiser',
            'brand' => 'Toyota', 'type' => 'suv', 'km' => 120500,
            'color' => '#800000', 'year' => 2020,
        ]);
        $v3 = Vehicle::firstOrCreate(['plate_number' => 'G H I 9012', 'user_id' => $user->id], [
            'user_id' => $user->id, 'name_ar' => 'كورولا', 'name_en' => 'Corolla',
            'brand' => 'Toyota', 'type' => 'sedan', 'km' => 45200,
            'color' => '#800000', 'year' => 2023,
        ]);

        // ── Reminders ─────────────────────────────────────────────────────────
        $remData = [
            [$v1->id, $svc[0]->id, 'تغيير الزيت',    '2026-05-15', 90000],
            [$v1->id, $svc[1]->id, 'فلتر الهواء',    '2026-07-01', null],
            [$v1->id, $svc[2]->id, 'فحص الإطارات',   '2026-06-20', 95000],
            [$v1->id, $svc[3]->id, 'فحص الفرامل',    '2026-08-10', null],
            [$v1->id, $svc[5]->id, 'فلتر الكابين',   '2026-09-01', 100000],
            [$v2->id, $svc[0]->id, 'تغيير الزيت',    '2026-04-20', 125000],
            [$v2->id, $svc[3]->id, 'فحص الفرامل',    '2026-05-30', 130000],
            [$v2->id, $svc[2]->id, 'فحص الإطارات',   '2026-07-15', 135000],
            [$v3->id, $svc[4]->id, 'تغيير البطارية', '2026-08-01', null],
            [$v3->id, $svc[0]->id, 'تغيير الزيت',    '2026-05-01', 50000],
        ];
        foreach ($remData as [$vid, $sid, $title, $date, $km]) {
            Reminder::firstOrCreate(
                ['user_id' => $user->id, 'vehicle_id' => $vid, 'service_id' => $sid, 'title_ar' => $title],
                ['due_date' => $date, 'due_km' => $km, 'completed' => false]
            );
        }

        // ── Records ───────────────────────────────────────────────────────────
        $recData = [
            [$v1->id,$svc[0]->id,'2026-01-15',80000, 250, 'تم التغيير في الوكالة',        'Toyota Abu Dhabi'],
            [$v1->id,$svc[1]->id,'2025-12-10',75000, 80,  'فلتر أصلي',                   'Al Ameen Workshop'],
            [$v1->id,$svc[2]->id,'2025-11-05',70000, 1200,'تغيير الإطارات الأمامية',      'Tire Shop Dubai'],
            [$v2->id,$svc[0]->id,'2026-01-20',115000,300, 'زيت 5W-40',                   'Land Cruiser Center'],
            [$v2->id,$svc[3]->id,'2025-10-15',110000,450, 'تغيير تيل الفرامل',            'Al Najm Workshop'],
            [$v3->id,$svc[4]->id,'2025-09-01',40000, 350, 'بطارية 70 أمبير جديدة',        'Battery Store'],
            [$v1->id,$svc[0]->id,'2025-08-10',72000, 230, '',                             'Al Amanah Workshop'],
            [$v2->id,$svc[2]->id,'2025-07-20',105000,1800,'تغيير الإطارات الأربعة',       'Wheel & Tire Dubai'],
            [$v3->id,$svc[0]->id,'2025-06-05',38000, 210, '',                             'Gulf Workshop'],
            [$v1->id,$svc[3]->id,'2025-05-12',65000, 380, 'تغيير أقراص الفرامل الأمامية','Service Center'],
        ];
        foreach ($recData as [$vid,$sid,$date,$km,$cost,$notes,$provider]) {
            Record::firstOrCreate(
                ['user_id'=>$user->id,'vehicle_id'=>$vid,'service_id'=>$sid,'date'=>$date,'km'=>$km],
                ['cost'=>$cost,'notes'=>$notes,'provider'=>$provider]
            );
        }

        // ── Warranties ────────────────────────────────────────────────────────
        $warData = [
            [$v1->id,'ضمان المحرك',  'Engine Warranty',        '🔩','2026-12-31','Toyota Abu Dhabi',''],
            [$v1->id,'ضمان الهيكل',  'Body Warranty',          '🚗','2027-06-30','Toyota Abu Dhabi',''],
            [$v2->id,'ضمان المحرك',  'Engine Warranty',        '🔩','2025-08-15','Toyota UAE',      ''],
            [$v2->id,'ضمان الكهرباء','Electrical Warranty',    '⚡','2026-03-10','Toyota UAE',      ''],
            [$v3->id,'ضمان شامل',    'Comprehensive Warranty', '🛡️','2026-09-01','Toyota Abu Dhabi',''],
            [$v3->id,'ضمان البطارية','Battery Warranty',       '🔋','2028-01-01','Toyota Abu Dhabi','70 Ah'],
        ];
        foreach ($warData as [$vid,$titleAr,$titleEn,$icon,$expiry,$provider,$notes]) {
            Warranty::firstOrCreate(
                ['user_id'=>$user->id,'vehicle_id'=>$vid,'title_en'=>$titleEn],
                ['title_ar'=>$titleAr,'icon'=>$icon,'expiry_date'=>$expiry,'provider'=>$provider,'notes'=>$notes]
            );
        }
    }
}
