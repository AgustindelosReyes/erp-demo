<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Movement;
use App\Models\MovementItem;
use Carbon\Carbon;

class SalesSummaryTest extends TestCase
{
    use RefreshDatabase;

    public function test_monthly_sales_summary_returns_correct_totals()
    {
        // Create user and authenticate
        $user = User::factory()->create();
        $token = $user->createToken('API Token')->plainTextToken;

        // Create products
        $product1 = Product::factory()->create(['stock' => 100]);
        $product2 = Product::factory()->create(['stock' => 100]);

        // Define test month and year
        $testMonth = 5;
        $testYear = 2023;

        // Create sales movements in the test month
        $movement1 = Movement::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product1->id,
            'quantity' => 10,
            'status' => 'completado',
            'movement_type' => 'venta',
            'created_at' => Carbon::create($testYear, $testMonth, 15, 10, 0, 0),
        ]);

        MovementItem::factory()->create([
            'movement_id' => $movement1->id,
            'product_id' => $product1->id,
            'quantity' => 2,
            'price' => 50.00,
        ]);

        MovementItem::factory()->create([
            'movement_id' => $movement1->id,
            'product_id' => $product2->id,
            'quantity' => 3,
            'price' => 30.00,
        ]);

        $movement2 = Movement::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product2->id,
            'quantity' => 5,
            'status' => 'completado',
            'movement_type' => 'venta',
            'created_at' => Carbon::create($testYear, $testMonth, 20, 14, 0, 0),
        ]);

        MovementItem::factory()->create([
            'movement_id' => $movement2->id,
            'product_id' => $product2->id,
            'quantity' => 5,
            'price' => 40.00,
        ]);

        // Calculate expected totals
        $expectedTotalSales = (2 * 50.00) + (3 * 30.00) + (5 * 40.00); // 100 + 90 + 200 = 390
        $expectedTotalMovements = 2; // Two distinct movements

        // Make request
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/sales/summary?month=' . $testMonth . '&year=' . $testYear);

        // Assert response
        $response->assertStatus(200)
                  ->assertJson([
                      'totalSales' => $expectedTotalSales,
                      'totalMovements' => $expectedTotalMovements,
                  ]);
    }

    public function test_monthly_sales_summary_with_no_sales()
    {
        // Create user and authenticate
        $user = User::factory()->create();
        $token = $user->createToken('API Token')->plainTextToken;

        // Define test month and year with no sales
        $testMonth = 6;
        $testYear = 2023;

        // Make request
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/sales/summary?month=' . $testMonth . '&year=' . $testYear);

        // Assert response
        $response->assertStatus(200)
                  ->assertJson([
                      'totalSales' => 0,
                      'totalMovements' => 0,
                  ]);
    }

    public function test_compare_with_previous_month_with_sales()
    {
        // Create user and authenticate
        $user = User::factory()->create();
        $token = $user->createToken('API Token')->plainTextToken;

        // Create products
        $product1 = Product::factory()->create(['stock' => 100]);
        $product2 = Product::factory()->create(['stock' => 100]);

        // Define current month and year (June 2023)
        $currentMonth = 6;
        $currentYear = 2023;

        // Define previous month and year (May 2023)
        $prevMonth = 5;
        $prevYear = 2023;

        // Create sales movements in the current month
        $movement1 = Movement::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product1->id,
            'quantity' => 10,
            'status' => 'completado',
            'movement_type' => 'venta',
            'created_at' => Carbon::create($currentYear, $currentMonth, 15, 10, 0, 0),
        ]);

        MovementItem::factory()->create([
            'movement_id' => $movement1->id,
            'product_id' => $product1->id,
            'quantity' => 2,
            'price' => 50.00,
        ]);

        MovementItem::factory()->create([
            'movement_id' => $movement1->id,
            'product_id' => $product2->id,
            'quantity' => 3,
            'price' => 30.00,
        ]);

        // Create sales movements in the previous month
        $prevMovement = Movement::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product2->id,
            'quantity' => 5,
            'status' => 'completado',
            'movement_type' => 'venta',
            'created_at' => Carbon::create($prevYear, $prevMonth, 20, 14, 0, 0),
        ]);

        MovementItem::factory()->create([
            'movement_id' => $prevMovement->id,
            'product_id' => $product2->id,
            'quantity' => 5,
            'price' => 40.00,
        ]);

        // Calculate expected totals for current month
        $expectedCurrentTotalSales = (2 * 50.00) + (3 * 30.00); // 100 + 90 = 190
        $expectedCurrentTotalMovements = 1; // One movement

        // Calculate expected totals for previous month
        $expectedPrevTotalSales = 5 * 40.00; // 200
        $expectedPrevTotalMovements = 1; // One movement

        // Calculate differences
        $expectedSalesDifference = $expectedCurrentTotalSales - $expectedPrevTotalSales; // 190 - 200 = -10
        $expectedMovementsDifference = $expectedCurrentTotalMovements - $expectedPrevTotalMovements; // 1 - 1 = 0

        // Make request with comparePrevious=true
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/sales/summary?month=' . $currentMonth . '&year=' . $currentYear . '&comparePrevious=true');

        // Assert response
        $response->assertStatus(200)
                  ->assertJson([
                      'totalSales' => $expectedCurrentTotalSales,
                      'totalMovements' => $expectedCurrentTotalMovements,
                      'previousTotalSales' => $expectedPrevTotalSales,
                      'previousTotalMovements' => $expectedPrevTotalMovements,
                      'salesDifference' => $expectedSalesDifference,
                      'movementsDifference' => $expectedMovementsDifference,
                  ]);
    }

    public function test_compare_with_previous_month_without_sales()
    {
        // Create user and authenticate
        $user = User::factory()->create();
        $token = $user->createToken('API Token')->plainTextToken;

        // Create products
        $product1 = Product::factory()->create(['stock' => 100]);
        $product2 = Product::factory()->create(['stock' => 100]);

        // Define current month and year (June 2023)
        $currentMonth = 6;
        $currentYear = 2023;

        // Previous month (May 2023) will have no sales

        // Create sales movements in the current month
        $movement1 = Movement::factory()->create([
            'user_id' => $user->id,
            'product_id' => $product1->id,
            'quantity' => 10,
            'status' => 'completado',
            'movement_type' => 'venta',
            'created_at' => Carbon::create($currentYear, $currentMonth, 15, 10, 0, 0),
        ]);

        MovementItem::factory()->create([
            'movement_id' => $movement1->id,
            'product_id' => $product1->id,
            'quantity' => 2,
            'price' => 50.00,
        ]);

        MovementItem::factory()->create([
            'movement_id' => $movement1->id,
            'product_id' => $product2->id,
            'quantity' => 3,
            'price' => 30.00,
        ]);

        // Calculate expected totals for current month
        $expectedCurrentTotalSales = (2 * 50.00) + (3 * 30.00); // 100 + 90 = 190
        $expectedCurrentTotalMovements = 1; // One movement

        // Previous month has no sales
        $expectedPrevTotalSales = 0;
        $expectedPrevTotalMovements = 0;

        // Calculate differences
        $expectedSalesDifference = $expectedCurrentTotalSales - $expectedPrevTotalSales; // 190 - 0 = 190
        $expectedMovementsDifference = $expectedCurrentTotalMovements - $expectedPrevTotalMovements; // 1 - 0 = 1

        // Make request with comparePrevious=true
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/sales/summary?month=' . $currentMonth . '&year=' . $currentYear . '&comparePrevious=true');

        // Assert response
        $response->assertStatus(200)
                  ->assertJson([
                      'totalSales' => $expectedCurrentTotalSales,
                      'totalMovements' => $expectedCurrentTotalMovements,
                      'previousTotalSales' => $expectedPrevTotalSales,
                      'previousTotalMovements' => $expectedPrevTotalMovements,
                      'salesDifference' => $expectedSalesDifference,
                      'movementsDifference' => $expectedMovementsDifference,
                  ]);
    }

    public function test_invalid_month()
    {
        // Create user and authenticate
        $user = User::factory()->create();
        $token = $user->createToken('API Token')->plainTextToken;

        // Make request with invalid month
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/sales/summary?month=13&year=2023');

        // Assert response
        $response->assertStatus(400)
                  ->assertJson([
                      'errors' => [
                          'month' => ['The month may not be greater than 12.'],
                      ],
                  ]);
    }

    public function test_invalid_year()
    {
        // Create user and authenticate
        $user = User::factory()->create();
        $token = $user->createToken('API Token')->plainTextToken;

        // Make request with invalid year
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/sales/summary?month=5&year=1899');

        // Assert response
        $response->assertStatus(400)
                  ->assertJson([
                      'errors' => [
                          'year' => ['The year must be at least 1900.'],
                      ],
                  ]);
    }

    public function test_missing_parameters()
    {
        // Create user and authenticate
        $user = User::factory()->create();
        $token = $user->createToken('API Token')->plainTextToken;

        // Make request without month and year
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/sales/summary');

        // Assert response
        $response->assertStatus(400)
                  ->assertJson([
                      'errors' => [
                          'month' => ['The month field is required.'],
                          'year' => ['The year field is required.'],
                      ],
                  ]);
    }
}