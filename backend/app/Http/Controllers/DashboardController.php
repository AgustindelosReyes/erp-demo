<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Product;
use App\Models\Movement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $totalUsers = User::where('id', '!=', auth()->id())->count();
        $totalProducts = Product::count();
        $totalMovements = Movement::count();

        $currentYear = now()->year;
        $currentMonth = now()->month;

        $totalSalesCurrentMonth = DB::table('movement_items as mi')
            ->join('movements as m', 'mi.movement_id', '=', 'm.id')
            ->where('m.movement_type', 'venta')
            ->where('m.status', 'completado')
            ->whereYear('m.created_at', $currentYear)
            ->whereMonth('m.created_at', $currentMonth)
            ->selectRaw('SUM(mi.quantity * mi.price) as total')
            ->value('total') ?? 0;

        return response()->json([
            'total_users' => $totalUsers,
            'total_products' => $totalProducts,
            'total_movements' => $totalMovements,
            'total_sales_current_month' => (float) $totalSalesCurrentMonth,
        ]);
    }
}