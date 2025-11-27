<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    // /**
    //  * Define the model's default state.
    //  *
    //  * @return array<string, mixed>
    //  */
    // public function definition(): array
    // {
    //     return [
    //         //
    //     ];
    // }
    public function definition()
    {
        return [
            'name' => $this->faker->word(),
            'description' => $this->faker->sentence(),
            'category' => $this->faker->randomElement(['hogar','pintura','ferreteria']),
            'stock' => $this->faker->numberBetween(0, 50),
            'stock_min' => 5,
            'price' => $this->faker->randomFloat(2, 500, 50000),
        ];
    }

}
