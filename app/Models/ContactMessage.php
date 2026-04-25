<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    protected $fillable = ['user_id', 'name', 'email', 'subject', 'message', 'read', 'reply', 'replied_at'];

    protected $casts = ['replied_at' => 'datetime'];
}
