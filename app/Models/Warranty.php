<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Warranty extends Model
{
    protected $fillable = ['user_id','vehicle_id','title_ar','title_en','icon','expiry_date','provider','notes'];
    protected $casts    = ['expiry_date' => 'date'];

    public function vehicle() { return $this->belongsTo(Vehicle::class); }
}
