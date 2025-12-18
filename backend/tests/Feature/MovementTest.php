<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Movement;
use App\Models\MovementItem;

class MovementTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_sale_with_sufficient_stock()
    {
        // Create user and authenticate
        $user = User::factory()->create();
        $token = $user->createToken('API Token')->plainTextToken;

        // Create products with sufficient stock
        $product1 = Product::factory()->create(['stock' => 10]);
        $product2 = Product::factory()->create(['stock' => 20]);

        // Record initial stock
        $initialStock1 = $product1->stock;
        $initialStock2 = $product2->stock;

        // Prepare sale data
        $items = [
            [
                'product_id' => $product1->id,
                'quantity' => 3,
                'price' => 100.00,
            ],
            [
                'product_id' => $product2->id,
                'quantity' => 5,
                'price' => 200.00,
            ],
        ];

        // Make request
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/movements', [
            'movement_type' => 'venta',
            'items' => $items
        ]);

        // Assert response
        $response->assertStatus(201)
                 ->assertJson(['message' => 'Sale movement registered successfully']);

        // Assert movement created
        $this->assertDatabaseHas('movements', [
            'user_id' => $user->id,
            'product_id' => $product1->id, // First product
            'quantity' => 8, // Total quantity
            'status' => 'completado',
            'movement_type' => 'venta',
        ]);

        // Get the created movement
        $movement = Movement::where('user_id', $user->id)->first();

        // Assert movement items created
        foreach ($items as $item) {
            $this->assertDatabaseHas('movement_items', [
                'movement_id' => $movement->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);
        }

        // Assert stock reduced
        $product1->refresh();
        $product2->refresh();
        $this->assertEquals($initialStock1 - 3, $product1->stock);
        $this->assertEquals($initialStock2 - 5, $product2->stock);
    }

    public function test_register_sale_with_insufficient_stock()
    {
        // Create user and authenticate
        $user = User::factory()->create();
        $token = $user->createToken('API Token')->plainTextToken;

        // Create products, one with insufficient stock
        $product1 = Product::factory()->create(['stock' => 10, 'name' => 'Product 1']);
        $product2 = Product::factory()->create(['stock' => 2, 'name' => 'Product 2']); // Insufficient for 5

        // Record initial stock
        $initialStock1 = $product1->stock;
        $initialStock2 = $product2->stock;

        // Prepare sale data with insufficient stock for product2
        $items = [
            [
                'product_id' => $product1->id,
                'quantity' => 3,
                'price' => 100.00,
            ],
            [
                'product_id' => $product2->id,
                'quantity' => 5, // More than available
                'price' => 200.00,
            ],
        ];

        // Make request
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/movements', [
            'movement_type' => 'venta',
            'items' => $items
        ]);

        // Assert response
        $response->assertStatus(400)
                 ->assertJson(['message' => 'Insufficient stock for the following products: Product 2']);

        // Assert no movement created
        $this->assertDatabaseMissing('movements', [
            'user_id' => $user->id,
        ]);

        // Assert no movement items created
        $this->assertDatabaseMissing('movement_items', [
            'product_id' => $product1->id,
        ]);
        $this->assertDatabaseMissing('movement_items', [
            'product_id' => $product2->id,
        ]);

        // Assert stock unchanged
        $product1->refresh();
        $product2->refresh();
        $this->assertEquals($initialStock1, $product1->stock);
        $this->assertEquals($initialStock2, $product2->stock);
    }

    public function test_register_stock_entry()
    {
        // Create user and authenticate
        $user = User::factory()->create();
        $token = $user->createToken('API Token')->plainTextToken;

        // Create products with initial stock
        $product1 = Product::factory()->create(['stock' => 10]);
        $product2 = Product::factory()->create(['stock' => 20]);
        $product3 = Product::factory()->create(['stock' => 5]); // Unaffected product

        // Record initial stock
        $initialStock1 = $product1->stock;
        $initialStock2 = $product2->stock;
        $initialStock3 = $product3->stock;

        // Prepare entry data
        $items = [
            [
                'product_id' => $product1->id,
                'quantity' => 3,
                'price' => 100.00,
            ],
            [
                'product_id' => $product2->id,
                'quantity' => 5,
                'price' => 200.00,
            ],
        ];

        // Make request
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/movements', [
            'movement_type' => 'entrada',
            'items' => $items
        ]);

        // Assert response
        $response->assertStatus(201)
                 ->assertJson(['message' => 'Entry movement registered successfully']);

        // Assert movement created
        $this->assertDatabaseHas('movements', [
            'user_id' => $user->id,
            'product_id' => $product1->id, // First product
            'quantity' => 8, // Total quantity
            'status' => 'completado',
            'movement_type' => 'entrada',
        ]);

        // Get the created movement
        $movement = Movement::where('user_id', $user->id)->first();

        // Assert movement items created
        foreach ($items as $item) {
            $this->assertDatabaseHas('movement_items', [
                'movement_id' => $movement->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);
        }

        // Assert stock increased
        $product1->refresh();
        $product2->refresh();
        $product3->refresh();
        $this->assertEquals($initialStock1 + 3, $product1->stock);
        $this->assertEquals($initialStock2 + 5, $product2->stock);
        $this->assertEquals($initialStock3, $product3->stock); // Unaffected
    }

    public function test_register_stock_adjustment_success()
    {
        // Create user and authenticate
        $user = User::factory()->create();
        $token = $user->createToken('API Token')->plainTextToken;

        // Create product with initial stock
        $product = Product::factory()->create(['stock' => 10]);

        // Record initial stock
        $initialStock = $product->stock;

        // Prepare adjustment data
        $adjustedStock = 25;

        // Make request
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/movements', [
            'movement_type' => 'ajuste',
            'product_id' => $product->id,
            'adjusted_stock' => $adjustedStock
        ]);

        // Assert response
        $response->assertStatus(201)
                 ->assertJson(['message' => 'Adjustment movement registered successfully']);

        // Assert movement created
        $this->assertDatabaseHas('movements', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => $adjustedStock,
            'status' => 'completado',
            'movement_type' => 'ajuste',
        ]);

        // Get the created movement
        $movement = Movement::where('user_id', $user->id)->first();

        // Assert movement item created
        $this->assertDatabaseHas('movement_items', [
            'movement_id' => $movement->id,
            'product_id' => $product->id,
            'quantity' => $adjustedStock,
            'price' => 0,
        ]);

        // Assert stock set to adjusted_stock
        $product->refresh();
        $this->assertEquals($adjustedStock, $product->stock);
    }

    public function test_register_stock_adjustment_to_zero()
    {
        // Create user and authenticate
        $user = User::factory()->create();
        $token = $user->createToken('API Token')->plainTextToken;

        // Create product with initial stock
        $product = Product::factory()->create(['stock' => 15]);

        // Record initial stock
        $initialStock = $product->stock;

        // Prepare adjustment data to zero
        $adjustedStock = 0;

        // Make request
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/movements', [
            'movement_type' => 'ajuste',
            'product_id' => $product->id,
            'adjusted_stock' => $adjustedStock
        ]);

        // Assert response
        $response->assertStatus(201)
                 ->assertJson(['message' => 'Adjustment movement registered successfully']);

        // Assert movement created
        $this->assertDatabaseHas('movements', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => $adjustedStock,
            'status' => 'completado',
            'movement_type' => 'ajuste',
        ]);

        // Get the created movement
        $movement = Movement::where('user_id', $user->id)->first();

        // Assert movement item created
        $this->assertDatabaseHas('movement_items', [
            'movement_id' => $movement->id,
            'product_id' => $product->id,
            'quantity' => $adjustedStock,
            'price' => 0,
        ]);

        // Assert stock set to zero
        $product->refresh();
        $this->assertEquals(0, $product->stock);
    }

    public function test_register_stock_adjustment_to_higher_value()
    {
        // Create user and authenticate
        $user = User::factory()->create();
        $token = $user->createToken('API Token')->plainTextToken;

        // Create product with initial stock
        $product = Product::factory()->create(['stock' => 5]);

        // Record initial stock
        $initialStock = $product->stock;

        // Prepare adjustment data to higher value
        $adjustedStock = 100;

        // Make request
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/movements', [
            'movement_type' => 'ajuste',
            'product_id' => $product->id,
            'adjusted_stock' => $adjustedStock
        ]);

        // Assert response
        $response->assertStatus(201)
                 ->assertJson(['message' => 'Adjustment movement registered successfully']);

        // Assert movement created
        $this->assertDatabaseHas('movements', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => $adjustedStock,
            'status' => 'completado',
            'movement_type' => 'ajuste',
        ]);

        // Get the created movement
        $movement = Movement::where('user_id', $user->id)->first();

        // Assert movement item created
        $this->assertDatabaseHas('movement_items', [
            'movement_id' => $movement->id,
            'product_id' => $product->id,
            'quantity' => $adjustedStock,
            'price' => 0,
        ]);

        // Assert stock set to adjusted_stock
        $product->refresh();
        $this->assertEquals($adjustedStock, $product->stock);
    }
}