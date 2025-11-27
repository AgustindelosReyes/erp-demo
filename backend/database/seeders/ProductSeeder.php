<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run()
    {
        $products = [
            [
                'name' => 'Pintura Blanca',
                'description' => 'Base látex',
                'category' => 'pintura',
                'stock' => 20,
                'stock_min' => 5,
                'price' => 15000,
            ],
            [
                'name' => 'Rodillo Profesional',
                'description' => 'Rodillo de lana 22 cm',
                'category' => 'herramienta',
                'stock' => 15,
                'stock_min' => 3,
                'price' => 8500,
            ],
            [
                'name' => 'Cinta de Enmascarar',
                'description' => 'Cinta 24mm',
                'category' => 'accesorio',
                'stock' => 30,
                'stock_min' => 10,
                'price' => 1200,
            ]
        ];

        foreach ($products as $p) {
            Product::create($p);
        }
    }
}

