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
        // Crear usuario de prueba
        $user = User::factory()->create([
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
        $user->assignRole('Admin');
    }
}