<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Movement>
 */
class MovementFactory extends Factory
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
            'user_id' => 1,
            'product_id' => 1,
            'quantity' => $this->faker->numberBetween(1, 5),
            'status' => 'pendiente',
            'movement_type' => $this->faker->randomElement(['venta','entrada','ajuste']),
        ];
    }

}
