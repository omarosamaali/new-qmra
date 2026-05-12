<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    protected $fillable = ['user_id', 'server_id', 'title', 'content', 'color_idx', 'reminder_date', 'reminder_time'];

    protected $casts = [
        'reminder_date' => 'date',
        'color_idx'     => 'integer',
    ];
}
