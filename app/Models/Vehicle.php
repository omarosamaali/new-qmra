<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = ['user_id','server_id','name_ar','name_en','brand','type','plate_number','km','unit','color','year','image','is_linked','link_code','registration_expiry','insurance_expiry','notes'];

    protected $casts = ['is_linked' => 'boolean', 'registration_expiry' => 'date', 'insurance_expiry' => 'date'];

    /** API may send `mil` / `miles`; app stores `mi` or `km`. */
    protected static function normalizeUnit(?string $unit): string
    {
        $u = strtolower(trim((string) $unit));

        return in_array($u, ['mi', 'mil', 'mile', 'miles'], true) ? 'mi' : 'km';
    }

    protected function unit(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => self::normalizeUnit($value),
            set: fn (?string $value) => self::normalizeUnit($value),
        );
    }

    public function reminders() { return $this->hasMany(Reminder::class); }
    public function records()   { return $this->hasMany(Record::class); }
    public function warranties(){ return $this->hasMany(Warranty::class); }
}
