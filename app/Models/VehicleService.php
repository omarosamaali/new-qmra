<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleService extends Model
{
    protected $fillable = ['vehicle_id','service_id','interval_km','interval_days','cost','notes'];

    public function vehicle() { return $this->belongsTo(Vehicle::class); }
    public function service() { return $this->belongsTo(Service::class); }
}
