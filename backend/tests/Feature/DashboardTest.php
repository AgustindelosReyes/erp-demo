<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Movement;
use App\Models\MovementItem;
use Carbon\Carbon;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_returns_correct_totals()
    {
        // Create users and authenticate
        $user = User::factory()->create();
        $token = $user->createToken('API Token')->plainTextToken;

        // Create 2 additional users
        User::factory(2)->create();

        // Create 3 products
        $product1 = Product::factory()->create(['stock' => 100]);
        $product2 = Product::factory()->create(['stock' => 100]);
        $product3 = Product::factory()->create(['stock' => 100]);

        // Get current month and year
        $currentYear = now()->year;
        $currentMonth = now()->month;
        $previousMonth = now()->subMonth()->month;
        $previousYear = now()->subMonth()->year;

        // Create 4 movements: 2 sales and 2 purchases in current month, plus 1 sale in previous month
        $saleMovement1 = Movement::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product1->id,
            'quantity' => 10,
            'status' => 'completado',
            'movement_type' => 'venta',
            'created_at' => Carbon::create($currentYear, $currentMonth, 15, 10, 0, 0),
        ]);

        MovementItem::factory()->create([
            'movement_id' => $saleMovement1->id,
            'product_id' => $product1->id,
            'quantity' => 2,
            'price' => 50.00,
        ]);

        MovementItem::factory()->create([
            'movement_id' => $saleMovement1->id,
            'product_id' => $product2->id,
            'quantity' => 3,
            'price' => 30.00,
        ]);

        $saleMovement2 = Movement::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product2->id,
            'quantity' => 5,
            'status' => 'completado',
            'movement_type' => 'venta',
            'created_at' => Carbon::create($currentYear, $currentMonth, 20, 14, 0, 0),
        ]);

        MovementItem::factory()->create([
            'movement_id' => $saleMovement2->id,
            'product_id' => $product2->id,
            'quantity' => 5,
            'price' => 40.00,
        ]);

        // Create 2 entrada movements
        Movement::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product3->id,
            'quantity' => 20,
            'status' => 'completado',
            'movement_type' => 'entrada',
            'created_at' => Carbon::create($currentYear, $currentMonth, 10, 9, 0, 0),
        ]);

        Movement::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product1->id,
            'quantity' => 15,
            'status' => 'completado',
            'movement_type' => 'entrada',
            'created_at' => Carbon::create($currentYear, $currentMonth, 25, 16, 0, 0),
        ]);

        // Create 1 sale movement in previous month
        $saleMovementPrevious = Movement::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product1->id,
            'quantity' => 2,
            'status' => 'completado',
            'movement_type' => 'venta',
            'created_at' => Carbon::create($previousYear, $previousMonth, 15, 10, 0, 0),
        ]);

        MovementItem::factory()->create([
            'movement_id' => $saleMovementPrevious->id,
            'product_id' => $product1->id,
            'quantity' => 2,
            'price' => 50.00,
        ]);

        // Calculate expected totals
        $expectedTotalUsers = 2; // 2 created (excluding authenticated)
        $expectedTotalProducts = 3;
        $expectedTotalMovements = 5;
        $expectedTotalSalesCurrentMonth = (2 * 50.00) + (3 * 30.00) + (5 * 40.00); // 100 + 90 + 200 = 390

        // Make request
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/dashboard');

        // Assert response
        $response->assertStatus(200)
                  ->assertJson([
                      'total_users' => $expectedTotalUsers,
                      'total_products' => $expectedTotalProducts,
                      'total_movements' => $expectedTotalMovements,
                      'total_sales_current_month' => (float) $expectedTotalSalesCurrentMonth,
                  ]);
    }

    public function test_dashboard_returns_zero_totals_when_no_data()
    {
        // Create user for authentication
        $user = User::factory()->create();
        $token = $user->createToken('API Token')->plainTextToken;

        // Make request
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/dashboard');

        // Assert response
        $response->assertStatus(200)
                  ->assertJson([
                      'total_users' => 0,
                      'total_products' => 0,
                      'total_movements' => 0,
                      'total_sales_current_month' => 0.0,
                  ]);
    }

    public function test_dashboard_response_structure()
    {
        // Create user for authentication
        $user = User::factory()->create();
        $token = $user->createToken('API Token')->plainTextToken;

        // Make request
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/dashboard');

        // Assert status
        $response->assertStatus(200);

        // Get JSON data
        $data = $response->json();

        // Assert exact keys
        $this->assertEquals(['total_users', 'total_products', 'total_movements', 'total_sales_current_month'], array_keys($data));

        // Assert each value is numeric and not null
        foreach ($data as $key => $value) {
            $this->assertIsNumeric($value);
            $this->assertNotNull($value);
        }
    }
}