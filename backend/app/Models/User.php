<?php

namespace App\Models;

// Añadir HasRoles
use Spatie\Permission\Traits\HasRoles; 
use Spatie\Permission\Models\Role; // Importar Role de Spatie (necesario para la relación roles())
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles; // Usar HasRoles de Spatie

    /**
     * The attributes that are mass assignable.
     * ES CRUCIAL que las columnas que se actualizan y se muestran estén aquí.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'active', 
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     * Usando la sintaxis de función (Laravel 10+).
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'active' => 'boolean', // CLAVE: Asegura que 'active' se maneje como booleano
        ];
    }
    
    /**
     * Sobrescribir la relación "roles" para asegurar que se resuelve correctamente 
     * al modelo de Spatie. (Aunque HasRoles lo hace automáticamente, esto lo asegura).
     */
    public function roles()
    {
        // Retorna la relación de Spatie HasRoles, apuntando a la clase Role::class.
        return $this->morphToMany(
            Role::class, // Usamos la clase de Spatie
            'model',
            config('permission.table_names.model_has_roles'),
            config('permission.column_names.model_morph_key') ?: 'model_id',
            'role_id'
        );
    }
}