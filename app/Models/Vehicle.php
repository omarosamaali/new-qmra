<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = ['user_id','server_id','name_ar','name_en','brand','type','plate_number','km','unit','color','year','image','is_linked','link_code','registration_expiry','insurance_expiry'];

    protected $casts = ['is_linked' => 'boolean', 'registration_expiry' => 'date', 'insurance_expiry' => 'date'];

    public function reminders() { return $this->hasMany(Reminder::class); }
    public function records()   { return $this->hasMany(Record::class); }
    public function warranties(){ return $this->hasMany(Warranty::class); }
}
