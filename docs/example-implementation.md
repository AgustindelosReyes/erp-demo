# Example Implementation: Applying Documentation Standards

This document shows how to apply the documentation standards to existing and new endpoints in the Laravel ERP project.

## Applying Standards to Existing Endpoints

### 1. ProductController - Index Method

**Before (Current Implementation):**
```php
public function index()
{
    $products = Product::orderBy('id', 'desc')->paginate(15);
    return response()->json([
        'data' => $products->items(),
        'pagination' => [
            'total' => $products->total(),
            'per_page' => $products->perPage(),
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
        ],
    ]);
}
```

**After (With Documentation Standards):**
```php
/**
 * @group ERP Operations
 * @subgroup Products
 * 
 * Get paginated list of products.
 * 
 * Returns a paginated list of all products with their current stock levels and pricing.
 * 
 * @authenticated
 * 
 * @queryParam page integer Page number for pagination. Example: 1
 * @queryParam per_page integer Number of items per page (max 100). Example: 15
 * @queryParam search string Search term to filter products by name or description. Example: laptop
 * @queryParam category string Filter products by category. Example: electronics
 * @queryParam sort string Sort field (name, price, stock, created_at). Example: created_at
 * @queryParam direction string Sort direction (asc, desc). Example: desc
 * 
 * @response 200 {
 *     "data": [
 *         {
 *             "id": 123,
 *             "name": "Wireless Mouse",
 *             "description": "High-precision wireless mouse with ergonomic design",
 *             "category": "Electronics",
 *             "stock": 50,
 *             "stock_min": 10,
 *             "price": 29.99,
 *             "created_at": "2024-01-15T10:30:00Z",
 *             "updated_at": "2024-01-15T10:30:00Z"
 *         }
 *     ],
 *     "pagination": {
 *         "total": 150,
 *         "per_page": 15,
 *         "current_page": 1,
 *         "last_page": 10,
 *         "from": 1,
 *         "to": 15
 *     }
 * }
 * 
 * @response 401 {
 *     "message": "Unauthenticated."
 * }
 */
public function index(Request $request)
{
    $query = Product::query();
    
    // Apply search filter
    if ($request->filled('search')) {
        $query->where('name', 'like', '%' . $request->search . '%')
              ->orWhere('description', 'like', '%' . $request->search . '%');
    }
    
    // Apply category filter
    if ($request->filled('category')) {
        $query->where('category', $request->category);
    }
    
    // Apply sorting
    $sort = $request->get('sort', 'created_at');
    $direction = $request->get('direction', 'desc');
    $query->orderBy($sort, $direction);
    
    $products = $query->orderBy('id', 'desc')->paginate($request->get('per_page', 15));
    
    return response()->json([
        'data' => $products->items(),
        'pagination' => [
            'total' => $products->total(),
            'per_page' => $products->perPage(),
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
            'from' => $products->firstItem(),
            'to' => $products->lastItem(),
        ],
    ]);
}
```

### 2. MovementController - Store Method

**Before (Current Implementation):**
```php
public function store(StoreMovementRequest $request)
{
    // Complex business logic implementation
}
```

**After (With Documentation Standards):**
```php
/**
 * @group ERP Operations
 * @subgroup Movements
 * 
 * Register a new movement (sale, entry, or stock adjustment).
 * 
 * This endpoint handles three types of movements:
 * - venta: Decreases stock, requires items with prices
 * - entrada: Increases stock, requires items with prices
 * - ajuste: Sets exact stock level, requires product_id and adjusted_stock
 * 
 * For sales, stock validation is performed to ensure sufficient inventory.
 * All operations are wrapped in database transactions for consistency.
 * 
 * @authenticated
 * 
 * @bodyParam movement_type string required The type of movement. Must be one of: venta, entrada, ajuste. Example: venta
 * @bodyParam items array required_if:movement_type,venta|required_if:movement_type,entrada Array of movement items. Example: [{"product_id": 1, "quantity": 2, "price": 29.99}]
 * @bodyParam items.*.product_id integer required The product ID. Example: 1
 * @bodyParam items.*.quantity integer required min:1 The quantity to move. Example: 2
 * @bodyParam items.*.price number required min:0 The price per unit. Example: 29.99
 * @bodyParam product_id integer required_if:movement_type,ajuste The product ID for adjustment. Example: 1
 * @bodyParam adjusted_stock integer required_if:movement_type,ajuste The adjusted stock level. Example: 100
 * 
 * @response 201 {
 *     "message": "Sale movement registered successfully"
 * }
 * 
 * @response 201 {
 *     "message": "Entry movement registered successfully"
 * }
 * 
 * @response 201 {
 *     "message": "Adjustment movement registered successfully"
 * }
 * 
 * @response 400 {
 *     "message": "Insufficient stock for the following products: Wireless Mouse"
 * }
 * 
 * @response 404 {
 *     "message": "Product not found"
 * }
 * 
 * @response 422 {
 *     "message": "The given data was invalid.",
 *     "errors": {
 *         "movement_type": ["The movement type field is required."],
 *         "items": ["The items field is required when movement type is venta."]
 *     }
 * }
 * 
 * @response 500 {
 *     "message": "Failed to create movement"
 * }
 */
public function store(StoreMovementRequest $request)
{
    $movement_type = $request->movement_type;

    if ($movement_type === 'ajuste') {
        $product = Product::findOrFail($request->product_id);

        DB::beginTransaction();
        try {
            $product->update(['stock' => $request->adjusted_stock]);

            $movement = Movement::create([
                'user_id' => Auth::id(),
                'product_id' => $request->product_id,
                'quantity' => $request->adjusted_stock,
                'status' => 'completado',
                'movement_type' => 'ajuste',
            ]);

            MovementItem::create([
                'movement_id' => $movement->id,
                'product_id' => $request->product_id,
                'quantity' => $request->adjusted_stock,
                'price' => 0,
            ]);

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create adjustment movement'], 500);
        }

        return response()->json(['message' => 'Adjustment movement registered successfully'], 201);
    }

    $items = $request->items;

    // Get all products involved
    $productIds = collect($items)->pluck('product_id')->unique();
    $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

    // Check stock availability only for venta
    if ($movement_type === 'venta') {
        $insufficientStock = [];
        foreach ($items as $item) {
            $product = $products[$item['product_id']] ?? null;
            if (!$product || $product->stock < $item['quantity']) {
                $insufficientStock[] = $product ? $product->name : 'Unknown product';
            }
        }

        if (!empty($insufficientStock)) {
            return response()->json([
                'message' => 'Insufficient stock for the following products: ' . implode(', ', $insufficientStock)
            ], 400);
        }
    }

    // Proceed with transaction
    DB::beginTransaction();
    try {
        $totalQuantity = collect($items)->sum('quantity');
        $firstProductId = $items[0]['product_id'];

        // Create Movement
        $movement = Movement::create([
            'user_id' => Auth::id(),
            'product_id' => $firstProductId,
            'quantity' => $totalQuantity,
            'status' => 'completado',
            'movement_type' => $movement_type,
        ]);

        // Create MovementItems
        foreach ($items as $item) {
            MovementItem::create([
                'movement_id' => $movement->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);
        }

        // Adjust stock
        foreach ($items as $item) {
            if ($movement_type === 'venta') {
                $products[$item['product_id']]->decrement('stock', $item['quantity']);
            } else {
                $products[$item['product_id']]->increment('stock', $item['quantity']);
            }
        }

        DB::commit();
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['error' => 'Failed to create movement'], 500);
    }

    $message = $movement_type === 'venta' ? 'Sale movement registered successfully' : 'Entry movement registered successfully';
    return response()->json(['message' => $message], 201);
}
```

## Creating New Endpoints with Standards

### Example: Product Analytics Endpoint

```php
<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\MovementItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * @group Analytics
 * @subgroup Products
 */
class ProductAnalyticsController extends Controller
{
    /**
     * Get product performance analytics.
     * 
     * Returns detailed analytics for products including sales performance,
     * stock levels, and movement history over a specified period.
     * 
     * @authenticated
     * @middleware role:admin,manager
     * 
     * @queryParam start_date string Start date for the analysis period (YYYY-MM-DD). Example: 2024-01-01
     * @queryParam end_date string End date for the analysis period (YYYY-MM-DD). Example: 2024-01-31
     * @queryParam category string Filter by product category. Example: electronics
     * @queryParam min_sales integer Minimum sales quantity to include in results. Example: 10
     * @queryParam sort string Sort field (sales, revenue, stock_level). Example: sales
     * @queryParam direction string Sort direction (asc, desc). Example: desc
     * @queryParam limit integer Maximum number of results to return. Example: 20
     * 
     * @response 200 {
     *     "data": [
     *         {
     *             "product_id": 1,
     *             "product_name": "Wireless Mouse",
     *             "category": "Electronics",
     *             "current_stock": 50,
     *             "stock_min": 10,
     *             "sales_quantity": 150,
     *             "sales_revenue": 4498.50,
     *             "average_price": 29.99,
     *             "movement_count": 25,
     *             "last_movement": "2024-01-31T15:30:00Z",
     *             "performance_score": 8.5
     *         }
     *     ],
     *     "summary": {
     *         "total_products": 150,
     *         "total_sales": 5000,
     *         "total_revenue": 125000.00,
     *         "avg_performance_score": 7.2
     *     },
     *     "filters": {
     *         "start_date": "2024-01-01",
     *         "end_date": "2024-01-31",
     *         "category": null,
     *         "min_sales": 10
     *     }
     * }
     * 
     * @response 400 {
     *     "message": "Invalid date range",
     *     "errors": {
     *         "start_date": ["The start date must be before the end date."]
     *     }
     * }
     * 
     * @response 403 {
     *     "message": "This action is unauthorized."
     * }
     */
    public function performance(Request $request)
    {
        $validator = $this->validateAnalyticsRequest($request);
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Invalid request parameters',
                'errors' => $validator->errors()
            ], 400);
        }

        $data = $this->calculateProductPerformance($request);
        
        return response()->json([
            'data' => $data['products'],
            'summary' => $data['summary'],
            'filters' => $data['filters']
        ]);
    }

    /**
     * Get low stock alert products.
     * 
     * Returns products that are below their minimum stock threshold
     * and need immediate attention.
     * 
     * @authenticated
     * 
     * @queryParam category string Filter by product category. Example: electronics
     * @queryParam urgency string Urgency level (critical, warning). Example: critical
     * @queryParam sort string Sort field (stock_level, days_until_empty). Example: stock_level
     * 
     * @response 200 {
     *     "data": [
     *         {
     *             "product_id": 1,
     *             "product_name": "Wireless Mouse",
     *             "category": "Electronics",
     *             "current_stock": 5,
     *             "stock_min": 10,
     *             "stock_status": "critical",
     *             "urgency_level": "high",
     *             "recommended_order": 20,
     *             "last_restock": "2024-01-15T10:00:00Z"
     *         }
     *     ],
     *     "summary": {
     *         "total_critical": 15,
     *         "total_warning": 25,
     *         "total_products": 40
     *     }
     * }
     */
    public function lowStock(Request $request)
    {
        $products = Product::whereColumn('stock', '<', 'stock_min')
            ->when($request->filled('category'), function ($query) use ($request) {
                return $query->where('category', $request->category);
            })
            ->with(['movements' => function ($query) {
                return $query->latest()->limit(5);
            }])
            ->get();

        $alertProducts = $products->map(function ($product) {
            return [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'category' => $product->category,
                'current_stock' => $product->stock,
                'stock_min' => $product->stock_min,
                'stock_status' => $product->stock < ($product->stock_min * 0.5) ? 'critical' : 'warning',
                'urgency_level' => $product->stock < ($product->stock_min * 0.3) ? 'high' : 'medium',
                'recommended_order' => max(0, $product->stock_min - $product->stock + 10),
                'last_restock' => $product->movements->first()?->created_at,
            ];
        });

        return response()->json([
            'data' => $alertProducts,
            'summary' => [
                'total_critical' => $alertProducts->where('stock_status', 'critical')->count(),
                'total_warning' => $alertProducts->where('stock_status', 'warning')->count(),
                'total_products' => $alertProducts->count(),
            ]
        ]);
    }

    /**
     * Get product turnover analysis.
     * 
     * Analyzes product turnover rates and identifies fast-moving
     * and slow-moving products for inventory optimization.
     * 
     * @authenticated
     * 
     * @queryParam days integer Analysis period in days (default: 30). Example: 60
     * @queryParam category string Filter by product category. Example: electronics
     * @queryParam min_turnover float Minimum turnover rate to include. Example: 0.1
     * 
     * @response 200 {
     *     "data": [
     *         {
     *             "product_id": 1,
     *             "product_name": "Wireless Mouse",
     *             "category": "Electronics",
     *             "turnover_rate": 0.75,
     *             "turnover_category": "fast_moving",
     *             "avg_days_in_stock": 4.5,
     *             "total_movements": 25,
     *             "avg_movement_frequency": 2.3
     *         }
     *     ],
     *     "categories": {
     *         "fast_moving": 45,
     *         "medium_moving": 80,
     *         "slow_moving": 25
     *     }
     * }
     */
    public function turnover(Request $request)
    {
        $days = $request->get('days', 30);
        $endDate = now();
        $startDate = $endDate->copy()->subDays($days);

        $products = Product::with(['movements' => function ($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }])->get();

        $turnoverAnalysis = $products->map(function ($product) use ($days) {
            $movements = $product->movements;
            $totalMovementDays = $movements->count() > 0 ? 
                $movements->max('created_at')->diffInDays($movements->min('created_at')) : 0;
            
            $turnoverRate = $days > 0 ? ($movements->count() / $days) : 0;
            $avgDaysInStock = $movements->count() > 0 ? ($totalMovementDays / $movements->count()) : 0;
            $avgFrequency = $days > 0 ? ($movements->count() / $days) : 0;

            $category = 'slow_moving';
            if ($turnoverRate >= 0.5) {
                $category = 'fast_moving';
            } elseif ($turnoverRate >= 0.2) {
                $category = 'medium_moving';
            }

            return [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'category' => $product->category,
                'turnover_rate' => round($turnoverRate, 2),
                'turnover_category' => $category,
                'avg_days_in_stock' => round($avgDaysInStock, 1),
                'total_movements' => $movements->count(),
                'avg_movement_frequency' => round($avgFrequency, 1),
            ];
        })->filter(function ($product) use ($request) {
            return $request->get('min_turnover', 0) <= $product['turnover_rate'];
        });

        return response()->json([
            'data' => $turnoverAnalysis,
            'categories' => [
                'fast_moving' => $turnoverAnalysis->where('turnover_category', 'fast_moving')->count(),
                'medium_moving' => $turnoverAnalysis->where('turnover_category', 'medium_moving')->count(),
                'slow_moving' => $turnoverAnalysis->where('turnover_category', 'slow_moving')->count(),
            ]
        ]);
    }

    private function validateAnalyticsRequest(Request $request)
    {
        return validator($request->all(), [
            'start_date' => 'nullable|date|before_or_equal:end_date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'category' => 'nullable|string',
            'min_sales' => 'nullable|integer|min:0',
            'sort' => 'nullable|in:sales,revenue,stock_level',
            'direction' => 'nullable|in:asc,desc',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);
    }

    private function calculateProductPerformance(Request $request)
    {
        // Implementation would include complex database queries
        // to calculate sales, revenue, performance scores, etc.
        
        return [
            'products' => [],
            'summary' => [
                'total_products' => 0,
                'total_sales' => 0,
                'total_revenue' => 0,
                'avg_performance_score' => 0,
            ],
            'filters' => $request->only(['start_date', 'end_date', 'category', 'min_sales'])
        ];
    }
}
```

## Implementation Checklist

### For Existing Endpoints
- [ ] Add comprehensive documentation comments
- [ ] Document all request parameters with types and examples
- [ ] Add response examples for all status codes
- [ ] Specify authentication and authorization requirements
- [ ] Document validation rules that match FormRequest classes
- [ ] Test generated documentation

### For New Endpoints
- [ ] Plan documentation structure before implementation
- [ ] Create FormRequest validation classes
- [ ] Write documentation comments alongside code
- [ ] Use realistic examples in documentation
- [ ] Test all documented scenarios
- [ ] Include error handling documentation

### Quality Assurance
- [ ] Run `php artisan scribe:generate` to test documentation
- [ ] Review generated HTML documentation
- [ ] Test API endpoints with documented examples
- [ ] Validate authentication flows
- [ ] Check error response formats
- [ ] Ensure consistency across all endpoints

## Team Workflow Integration

### Code Review Process
1. **Documentation Review**: Check that all endpoints have complete documentation
2. **Example Validation**: Verify that examples work correctly
3. **Consistency Check**: Ensure documentation follows standards
4. **API Testing**: Test endpoints using documented parameters

### Continuous Integration
```yaml
# .github/workflows/documentation.yml
name: Documentation Check

on: [push, pull_request]

jobs:
  documentation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      - name: Install dependencies
        run: composer install
      - name: Generate documentation
        run: php artisan scribe:generate
      - name: Check for documentation issues
        run: php artisan scribe:check
```

### Pre-commit Hooks
```bash
#!/bin/sh
# .git/hooks/pre-commit

# Check if documentation needs to be updated
php artisan scribe:check
if [ $? -ne 0 ]; then
    echo "Documentation issues found. Please update documentation."
    exit 1
fi
```

This implementation approach ensures that all endpoints follow the established documentation standards and maintain consistency across the entire API.