<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
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

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'stock' => 'required|integer|min:0',
            'stock_min' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        $product = Product::create($validatedData);

        return response()->json(['message' => 'Product created successfully', 'data' => $product], 201);
    }

    public function show($id)
    {
        $product = Product::find($id);
        if ($product) {
            return response()->json(['data' => $product]);
        } else {
            return response()->json(['message' => 'Product not found'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string',
            'description' => 'sometimes|nullable|string',
            'category' => 'sometimes|nullable|string',
            'stock' => 'sometimes|integer|min:0',
            'stock_min' => 'sometimes|integer|min:0',
            'price' => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validatedData = $validator->validated();
        $product->update($validatedData);

        return response()->json(['message' => 'Product updated successfully', 'data' => $product], 200);
    }

    public function destroy($id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }
        $product->delete();
        return response()->noContent();
    }

    // Endpoint de estadísticas para el dashboard
    public function stats()
    {
        $totalProducts = Product::count();
        
        $lowStock = Product::whereRaw('stock <= stock_min')->count();
        
        $criticalStock = Product::whereRaw('stock < (stock_min * 0.5)')->count();
        
        // Productos con stock bajo (para mostrar en el dashboard)
        $lowStockProducts = Product::whereRaw('stock <= stock_min')
            ->orderBy('stock', 'asc')
            ->take(5)
            ->get(['id', 'name', 'stock', 'stock_min', 'price'])
            ->map(function ($product) {
                $percentage = $product->stock_min > 0 
                    ? min(($product->stock / $product->stock_min) * 100, 100) 
                    : 0;
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'stock' => $product->stock,
                    'stock_min' => $product->stock_min,
                    'percentage' => $percentage,
                ];
            });

        return response()->json([
            'data' => [
                'total_products' => $totalProducts,
                'low_stock' => $lowStock,
                'critical_stock' => $criticalStock,
                'low_stock_products' => $lowStockProducts,
            ]
        ]);
    }
}