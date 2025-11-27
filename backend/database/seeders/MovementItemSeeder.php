<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Movement;
use App\Models\Product;
use App\Models\MovementItem;


class MovementItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $movements = Movement::all();
        $products = Product::all();

        if ($movements->count() === 0 || $products->count() === 0) {
            return;
        }

        foreach ($movements as $movement) {

            // Elegimos un producto al azar
            $product = $products->random();

            MovementItem::create([
                'movement_id' => $movement->id,
                'product_id' => $product->id,
                'quantity' => rand(1, 5),
                'price' => $product->price,
            ]);
        }
    }
}
