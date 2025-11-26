<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Permisos básicos
        $permissions = [
            'crear productos',
            'editar productos',
            'eliminar productos',
            'ver productos',

            'crear movimientos',
            'ver movimientos',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Roles
        $admin = Role::firstOrCreate(['name' => 'Admin']);
        $usuario = Role::firstOrCreate(['name' => 'Usuario']);

        // Asignar permisos al Admin
        $admin->syncPermissions(Permission::all());

        // Asignar permisos mínimos al usuario común
        $usuario->syncPermissions([
            'ver productos',
            'ver movimientos',
        ]);
    }
}
