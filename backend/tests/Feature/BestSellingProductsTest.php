<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Movement;
use App\Models\MovementItem;

class BestSellingProductsTest extends TestCase
{
    use RefreshDatabase;

    public function test_best_selling_products_returns_correct_data()
    {
        // Given existing sales with multiple products and quantities
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        // Create products
        $product1 = Product::factory()->create(['name' => 'Product A']);
        $product2 = Product::factory()->create(['name' => 'Product B']);
        $product3 = Product::factory()->create(['name' => 'Product C']);

        // Create movements with type 'venta' and movement_items with varying quantities
        $movement1 = Movement::factory()->create([
            'user_id' => $user->id,
            'movement_type' => 'venta',
            'status' => 'completado',
        ]);

        MovementItem::factory()->create([
            'movement_id' => $movement1->id,
            'product_id' => $product1->id,
            'quantity' => 10,
        ]);

        MovementItem::factory()->create([
            'movement_id' => $movement1->id,
            'product_id' => $product2->id,
            'quantity' => 8,
        ]);

        $movement2 = Movement::factory()->create([
            'user_id' => $user->id,
            'movement_type' => 'venta',
            'status' => 'completado',
        ]);

        MovementItem::factory()->create([
            'movement_id' => $movement2->id,
            'product_id' => $product1->id,
            'quantity' => 5,
        ]);

        MovementItem::factory()->create([
            'movement_id' => $movement2->id,
            'product_id' => $product2->id,
            'quantity' => 3,
        ]);

        $movement3 = Movement::factory()->create([
            'user_id' => $user->id,
            'movement_type' => 'venta',
            'status' => 'completado',
        ]);

        MovementItem::factory()->create([
            'movement_id' => $movement3->id,
            'product_id' => $product3->id,
            'quantity' => 6,
        ]);

        // When sending authenticated GET request to /api/sales/best-selling-products
        $response = $this->getJson('/api/sales/best-selling-products');

        // Then response is 200, returns array of products with product_id, product_name, total_quantity, ordered descending by total_quantity
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     '*' => [
                         'product_id',
                         'product_name',
                         'total_quantity',
                     ],
                 ])
                 ->assertJson([
                     [
                         'product_id' => $product1->id,
                         'product_name' => 'Product A',
                         'total_quantity' => 15,
                     ],
                     [
                         'product_id' => $product2->id,
                         'product_name' => 'Product B',
                         'total_quantity' => 11,
                     ],
                     [
                         'product_id' => $product3->id,
                         'product_name' => 'Product C',
                         'total_quantity' => 6,
                     ],
                 ]);
   }

   public function test_best_selling_products_with_custom_limit()
   {
       // Given existing sales with multiple products and quantities
       $user = User::factory()->create();
       $this->actingAs($user, 'sanctum');

       // Create products
       $product1 = Product::factory()->create(['name' => 'Product A']);
       $product2 = Product::factory()->create(['name' => 'Product B']);
       $product3 = Product::factory()->create(['name' => 'Product C']);

       // Create movements with type 'venta' and movement_items with varying quantities
       $movement1 = Movement::factory()->create([
           'user_id' => $user->id,
           'movement_type' => 'venta',
           'status' => 'completado',
       ]);

       MovementItem::factory()->create([
           'movement_id' => $movement1->id,
           'product_id' => $product1->id,
           'quantity' => 10,
       ]);

       MovementItem::factory()->create([
           'movement_id' => $movement1->id,
           'product_id' => $product2->id,
           'quantity' => 8,
       ]);

       $movement2 = Movement::factory()->create([
           'user_id' => $user->id,
           'movement_type' => 'venta',
           'status' => 'completado',
       ]);

       MovementItem::factory()->create([
           'movement_id' => $movement2->id,
           'product_id' => $product1->id,
           'quantity' => 5,
       ]);

       MovementItem::factory()->create([
           'movement_id' => $movement2->id,
           'product_id' => $product2->id,
           'quantity' => 3,
       ]);

       $movement3 = Movement::factory()->create([
           'user_id' => $user->id,
           'movement_type' => 'venta',
           'status' => 'completado',
       ]);

       MovementItem::factory()->create([
           'movement_id' => $movement3->id,
           'product_id' => $product3->id,
           'quantity' => 6,
       ]);

       // When sending authenticated GET request with limit=2
       $response = $this->getJson('/api/sales/best-selling-products?limit=2');

       // Then response is 200, returns array of top 2 products
       $response->assertStatus(200)
                ->assertJsonStructure([
                    '*' => [
                        'product_id',
                        'product_name',
                        'total_quantity',
                    ],
                ])
                ->assertJsonCount(2)
                ->assertJson([
                    [
                        'product_id' => $product1->id,
                        'product_name' => 'Product A',
                        'total_quantity' => 15,
                    ],
                    [
                        'product_id' => $product2->id,
                        'product_name' => 'Product B',
                        'total_quantity' => 11,
                    ],
                ]);
   }

   public function test_best_selling_products_with_invalid_limit()
   {
       $user = User::factory()->create();
       $this->actingAs($user, 'sanctum');

       // When sending request with invalid limit=0
       $response = $this->getJson('/api/sales/best-selling-products?limit=0');

       // Then response is 400 with validation errors
       $response->assertStatus(400)
                ->assertJsonStructure(['errors' => ['limit']]);
   }

   public function test_best_selling_products_with_negative_limit()
   {
       $user = User::factory()->create();
       $this->actingAs($user, 'sanctum');

       // When sending request with negative limit=-1
       $response = $this->getJson('/api/sales/best-selling-products?limit=-1');

       // Then response is 400 with validation errors
       $response->assertStatus(400)
                ->assertJsonStructure(['errors' => ['limit']]);
   }

   public function test_best_selling_products_with_non_numeric_limit()
   {
       $user = User::factory()->create();
       $this->actingAs($user, 'sanctum');

       // When sending request with non-numeric limit=abc
       $response = $this->getJson('/api/sales/best-selling-products?limit=abc');

       // Then response is 400 with validation errors
       $response->assertStatus(400)
                ->assertJsonStructure(['errors' => ['limit']]);
   }

   public function test_best_selling_products_returns_empty_array_when_no_sales_exist()
   {
       // Given no sales exist
       $user = User::factory()->create();
       $this->actingAs($user, 'sanctum');

       // When GET /api/sales/best-selling-products
       $response = $this->getJson('/api/sales/best-selling-products');

       // Then 200 and empty array []
       $response->assertStatus(200)
                ->assertJson([]);
   }
}