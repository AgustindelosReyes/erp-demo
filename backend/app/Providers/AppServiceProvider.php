<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Spatie\Permission\Models\Role; // Importamos el modelo de Spatie

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Solución forzada para el error "Target class [role] does not exist."
        // Esto asegura que la clase 'role' (o Role::class) se resuelve correctamente al modelo de Spatie,
        // corrigiendo cualquier problema de carga de caché o del IoC de Laravel.
        $this->app->bind('role', function ($app) {
            return $app->make(Role::class);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}