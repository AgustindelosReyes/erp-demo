<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Movement;
use App\Models\Product;
use App\Models\User;

class MovementSeeder extends Seeder
{
    public function run(): void
    {
        // Usuario Admin (el que creaste en DatabaseSeeder)
        $admin = User::first();

        // Obtener productos
        $products = Product::all();

        if ($products->count() < 1) {
            $this->command->warn('No hay productos para crear movimientos.');
            return;
        }

        // Movimiento 1 — Entrada de stock
        Movement::create([
            'user_id' => $admin->id,
            'product_id' => $products[0]->id,
            'quantity' => 5,
            'status' => 'completado',
            'movement_type' => 'entrada',
        ]);

        // Movimiento 2 — Venta
        Movement::create([
            'user_id' => $admin->id,
            'product_id' => $products[1]->id,
            'quantity' => 2,
            'status' => 'pendiente',
            'movement_type' => 'venta',
        ]);

        // Movimiento 3 — Ajuste de stock
        Movement::create([
            'user_id' => $admin->id,
            'product_id' => $products[2]->id,
            'quantity' => 1,
            'status' => 'completado',
            'movement_type' => 'ajuste',
        ]);
    }
}
