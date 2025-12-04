<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Skip seeding if SKIP_SEEDING is set
        if (env('SKIP_SEEDING')) {
            return;
        }

        // Crear usuario de prueba si no existe
        $user = User::firstOrCreate([
            'email' => 'test@example.com',
        ], [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Seeder
        $this->call([
            RolesAndPermissionsSeeder::class,
            ProductSeeder::class,
            MovementSeeder::class,
            MovementItemSeeder::class,
        ]);

        // Asignar rol Admin al usuario de prueba
        $user->assignRole('admin');
    }
}