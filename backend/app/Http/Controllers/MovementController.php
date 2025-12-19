<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMovementRequest;
use App\Models\Movement;
use App\Models\MovementItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MovementController extends Controller
{
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
}