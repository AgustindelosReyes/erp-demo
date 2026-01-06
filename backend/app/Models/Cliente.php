<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'nombre',
        'email', 
        'telefono',
        'direccion',
        'fecha_registro',
        'total_compras',
        'avatar',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'fecha_registro' => 'datetime',
            'total_compras' => 'decimal:2',
        ];
    }

    /**
     * Get the table associated with the model.
     */
    public function getTable()
    {
        return 'clientes';
    }
}