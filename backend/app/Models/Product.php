<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'stock',
        'stock_min',
        'price'
    ];

    public function movementItems()
    {
        return $this->hasMany(MovementItem::class);
    }

    public function movements()
    {
        return $this->hasMany(Movement::class);
    }
}
