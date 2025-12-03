<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

// Importar los modelos de Spatie, aunque se usan indirectamente
use Spatie\Permission\Traits\HasRoles; 
use Spatie\Permission\Models\Role; // <-- NUEVO: Importar Role de Spatie

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    
    /**
     * Sobrescribir la relación "roles" para asegurar que se resuelve correctamente 
     * al modelo de Spatie.
     */
    public function roles()
    {
        // Retorna la relación de Spatie HasRoles, pero apuntando a la clase correcta.
        return $this->morphToMany(
            Role::class, // <-- Usamos la clase de Spatie
            'model',
            config('permission.table_names.model_has_roles'),
            config('permission.column_names.model_morph_key') ?: 'model_id',
            'role_id'
        );
    }
}