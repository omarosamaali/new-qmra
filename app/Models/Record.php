<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Record extends Model
{
    protected $fillable = ['user_id','vehicle_id','service_id','date','km','cost','notes','provider'];
    protected $casts    = ['date' => 'date', 'cost' => 'float'];

    public function vehicle() { return $this->belongsTo(Vehicle::class); }
    public function service() { return $this->belongsTo(Service::class); }
}
