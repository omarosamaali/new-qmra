<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reminder extends Model
{
    protected $fillable = ['user_id','vehicle_id','service_id','title_ar','notes','due_date','due_time','due_km','completed'];
    protected $casts    = ['completed' => 'boolean', 'due_date' => 'date'];

    public function vehicle() { return $this->belongsTo(Vehicle::class); }
    public function service() { return $this->belongsTo(Service::class); }
}
