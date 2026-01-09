<?php

namespace App\Http\Controllers;

use App\Models\Movement;
use App\Models\MovementItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class MovementController extends Controller
{
    public function index(Request $request)
    {
        $query = Movement::with(['user', 'product', 'items'])
            ->where('movement_type', 'venta')
            ->orderBy('id', 'desc');

        // Filtrar por estado si se proporciona
        if ($request->has('status') && $request->status !== 'todos') {
            $query->where('status', $request->status);
        }

        // Filtrar por período
        if ($request->periodo === 'hoy') {
            $query->whereDate('created_at', today());
        } elseif ($request->periodo === 'semana') {
            $query->whereBetween('created_at', [now()->subWeek(), now()]);
        } elseif ($request->periodo === 'mes') {
            $query->whereBetween('created_at', [now()->subMonth(), now()]);
        }

        $movements = $query->paginate(15);

        // Transformar datos para el frontend
        $data = $movements->map(function ($movement) {
            $total = $movement->items->sum(function ($item) {
                return $item->quantity * $item->price;
            });

            $subtotal = $total; // Sin descuento por ahora
            $descuento = 0; // Por implementar

            return [
                'id' => $movement->id,
                'numeroVenta' => 'VTA-' . str_pad($movement->id, 4, '0', STR_PAD_LEFT),
                'fecha' => $movement->created_at,
                'cliente' => 'Cliente General', // Por implementar si hay tabla de clientes
                'productos' => $movement->items->sum('quantity'),
                'subtotal' => $subtotal,
                'descuento' => $descuento,
                'total' => $subtotal - $descuento,
                'estado' => $movement->status === 'completado' ? 'completada' : 'pendiente',
                'metodoPago' => 'Efectivo', // Por implementar
                'vendedor' => $movement->user ? $movement->user->name : 'N/A',
            ];
        });

        return response()->json([
            'data' => $data,
            'pagination' => [
                'total' => $movements->total(),
                'per_page' => $movements->perPage(),
                'current_page' => $movements->currentPage(),
                'last_page' => $movements->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::transaction(function () use ($request) {
            $product = Product::findOrFail($request->product_id);

            // Crear movement
            $movement = Movement::create([
                'user_id' => $request->user()->id,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'status' => 'completado',
                'movement_type' => 'venta',
            ]);

            // Crear movement item
            MovementItem::create([
                'movement_id' => $movement->id,
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
                'price' => $product->price,
            ]);

            // Actualizar stock
            $product->stock -= $request->quantity;
            $product->save();

            return $movement;
        });

        return response()->json(['message' => 'Venta registrada correctamente'], 201);
    }

    public function show($id)
    {
        $movement = Movement::with(['user', 'product', 'items.product'])->find($id);

        if (!$movement) {
            return response()->json(['message' => 'Venta no encontrada'], 404);
        }

        $total = $movement->items->sum(function ($item) {
            return $item->quantity * $item->price;
        });

        return response()->json([
            'data' => [
                'id' => $movement->id,
                'numeroVenta' => 'VTA-' . str_pad($movement->id, 4, '0', STR_PAD_LEFT),
                'fecha' => $movement->created_at,
                'cliente' => 'Cliente General',
                'productos' => $movement->items->sum('quantity'),
                'subtotal' => $total,
                'descuento' => 0,
                'total' => $total,
                'estado' => $movement->status === 'completado' ? 'completada' : 'pendiente',
                'metodoPago' => 'Efectivo',
                'vendedor' => $movement->user ? $movement->user->name : 'N/A',
                'items' => $movement->items->map(function ($item) {
                    return [
                        'producto' => $item->product->name,
                        'cantidad' => $item->quantity,
                        'precio' => $item->price,
                        'subtotal' => $item->quantity * $item->price,
                    ];
                }),
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $movement = Movement::find($id);

        if (!$movement) {
            return response()->json(['message' => 'Venta no encontrada'], 404);
        }

        // Por ahora solo actualizamos el estado
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:pendiente,completado',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('status')) {
            $movement->status = $request->status;
            $movement->save();
        }

        return response()->json(['message' => 'Venta actualizada', 'data' => $movement]);
    }

    public function destroy($id)
    {
        $movement = Movement::find($id);

        if (!$movement) {
            return response()->json(['message' => 'Venta no encontrada'], 404);
        }

        // Restaurar stock si ya estaba completado
        if ($movement->status === 'completado') {
            foreach ($movement->items as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->stock += $item->quantity;
                    $product->save();
                }
            }
        }

        $movement->delete();

        return response()->noContent();
    }

    // Endpoint de estadísticas para el dashboard
    public function stats()
    {
        // Ventas totales completadas
        $ventasCompletadas = Movement::where('movement_type', 'venta')
            ->where('status', 'completado')
            ->with('items')
            ->get();

        $totalVentas = $ventasCompletadas->sum(function ($movement) {
            return $movement->items->sum(function ($item) {
                return $item->quantity * $item->price;
            });
        });
        $countVentas = $ventasCompletadas->count();

        // Ventas hoy
        $ventasHoy = Movement::where('movement_type', 'venta')
            ->where('status', 'completado')
            ->whereDate('created_at', today())
            ->with('items')
            ->get();

        $ventasHoyCount = $ventasHoy->count();
        $ventasHoyTotal = $ventasHoy->sum(function ($movement) {
            return $movement->items->sum(function ($item) {
                return $item->quantity * $item->price;
            });
        });

        // Pedidos activos (pendientes)
        $pedidosActivos = Movement::where('movement_type', 'venta')
            ->where('status', 'pendiente')
            ->count();

        // Productos con stock bajo
        $alertasStock = Product::whereRaw('stock <= stock_min')->count();

        // Actividad reciente (últimas 5 ventas)
        $actividadReciente = Movement::where('movement_type', 'venta')
            ->with(['user', 'items.product'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($movement) {
                $total = $movement->items->sum(function ($item) {
                    return $item->quantity * $item->price;
                });
                return [
                    'id' => $movement->id,
                    'tipo' => 'Venta #' . str_pad($movement->id, 4, '0', STR_PAD_LEFT),
                    'descripcion' => $movement->items->first()?->product?->name ?? 'Producto',
                    'monto' => $total,
                    'fecha' => $movement->created_at,
                ];
            });

        return response()->json([
            'data' => [
                'ventas_totales' => $totalVentas,
                'count_ventas' => $countVentas,
                'ventas_hoy' => $ventasHoyCount,
                'ventas_hoy_total' => $ventasHoyTotal,
                'pedidos_activos' => $pedidosActivos,
                'alertas_stock' => $alertasStock,
                'actividad_reciente' => $actividadReciente,
            ]
        ]);
    }
}
