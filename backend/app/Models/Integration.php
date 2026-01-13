<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Integration extends Model
{
    protected $fillable = [
        'provider',
        'name',
        'status',
        'config',
        'api_key',
        'connected_at',
    ];

    protected $casts = [
        'config' => 'array',
        'connected_at' => 'datetime',
    ];
}
