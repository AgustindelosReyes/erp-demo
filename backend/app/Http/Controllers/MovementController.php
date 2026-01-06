<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMovementRequest;
use App\Models\Movement;
use App\Models\MovementItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class MovementController extends Controller
{
    public function store(StoreMovementRequest $request)
    {
        $movement_type = $request->movement_type;

        if ($movement_type === 'ajuste') {
            $product = Product::findOrFail($request->product_id);

            DB::transaction(function () use ($request, $product) {
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
            });

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
        DB::transaction(function () use ($items, $products, $movement_type) {
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
        });

        $message = $movement_type === 'venta' ? 'Sale movement registered successfully' : 'Entry movement registered successfully';
        return response()->json(['message' => $message], 201);
    }

    public function salesSummary(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:1900|max:' . (date('Y') + 10),
            'comparePrevious' => 'sometimes|in:true,false,1,0',
        ], [
            'month.required' => 'The month field is required.',
            'month.integer' => 'The month must be an integer.',
            'month.min' => 'The month must be at least 1.',
            'month.max' => 'The month may not be greater than 12.',
            'year.required' => 'The year field is required.',
            'year.integer' => 'The year must be an integer.',
            'year.min' => 'The year must be at least 1900.',
            'year.max' => 'The year may not be greater than ' . (date('Y') + 10) . '.',
            'comparePrevious.in' => 'The comparePrevious field must be one of: true, false, 1, 0.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $result = DB::table('movements')
            ->join('movement_items', 'movements.id', '=', 'movement_items.movement_id')
            ->where('movements.movement_type', 'venta')
            ->whereMonth('movements.created_at', $request->month)
            ->whereYear('movements.created_at', $request->year)
            ->selectRaw('COALESCE(SUM(movement_items.price * movement_items.quantity), 0) as totalSales, COALESCE(COUNT(DISTINCT movements.id), 0) as totalMovements')
            ->first();

        $totalSales = $result->totalSales ?? 0;
        $totalMovements = $result->totalMovements ?? 0;

        $response = [
            'totalSales' => $totalSales,
            'totalMovements' => $totalMovements,
        ];

        if ($request->boolean('comparePrevious')) {
            // Calculate previous month and year
            $prevMonth = $request->month > 1 ? $request->month - 1 : 12;
            $prevYear = $request->month > 1 ? $request->year : $request->year - 1;

            $prevResult = DB::table('movements')
                ->join('movement_items', 'movements.id', '=', 'movement_items.movement_id')
                ->where('movements.movement_type', 'venta')
                ->whereMonth('movements.created_at', $prevMonth)
                ->whereYear('movements.created_at', $prevYear)
                ->selectRaw('COALESCE(SUM(movement_items.price * movement_items.quantity), 0) as totalSales, COALESCE(COUNT(DISTINCT movements.id), 0) as totalMovements')
                ->first();

            $previousTotalSales = $prevResult->totalSales ?? 0;
            $previousTotalMovements = $prevResult->totalMovements ?? 0;

            $response['previousTotalSales'] = $previousTotalSales;
            $response['previousTotalMovements'] = $previousTotalMovements;
            $response['salesDifference'] = $totalSales - $previousTotalSales;
            $response['movementsDifference'] = $totalMovements - $previousTotalMovements;
        }

        return response()->json($response);
    }
}