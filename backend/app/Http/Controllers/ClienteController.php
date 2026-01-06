<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClienteController extends Controller
{
    /**
     * Muestra una lista paginada de clientes.
     * GET /api/clientes
     */
    public function index(Request $request)
    {
        $perPage = 20;
        $clientes = Cliente::select('id', 'nombre', 'email', 'telefono', 'direccion', 'fecha_registro', 'total_compras', 'avatar')
            ->paginate($perPage);

        $data = $clientes->through(function($cliente) {
            return [
                'id' => $cliente->id,
                'nombre' => $cliente->nombre,
                'email' => $cliente->email,
                'telefono' => $cliente->telefono,
                'direccion' => $cliente->direccion,
                'fecha_registro' => $cliente->fecha_registro->toISOString(),
                'total_compras' => (float) $cliente->total_compras,
                'avatar' => $cliente->avatar,
            ];
        });

        return response()->json([
            'data' => $data->items(),
            'meta' => [
                'current_page' => $clientes->currentPage(),
                'last_page' => $clientes->lastPage(),
                'per_page' => $clientes->perPage(),
                'total' => $clientes->total(),
            ]
        ]);
    }

    /**
     * Almacena un nuevo cliente.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:clientes',
            'telefono' => 'required|string|max:50',
            'direccion' => 'required|string|max:500',
            'avatar' => 'nullable|string|max:255',
        ]);

        $cliente = Cliente::create([
            'nombre' => $validated['nombre'],
            'email' => $validated['email'],
            'telefono' => $validated['telefono'],
            'direccion' => $validated['direccion'],
            'fecha_registro' => now(),
            'total_compras' => 0.00,
            'avatar' => $validated['avatar'] ?? null,
        ]);

        return response()->json([
            'message' => 'Cliente creado',
            'data' => [
                'id' => $cliente->id,
                'nombre' => $cliente->nombre,
                'email' => $cliente->email,
                'telefono' => $cliente->telefono,
                'direccion' => $cliente->direccion,
                'fecha_registro' => $cliente->fecha_registro->toISOString(),
                'total_compras' => (float) $cliente->total_compras,
                'avatar' => $cliente->avatar,
            ]
        ], 201);
    }

    /**
     * Muestra el cliente especificado.
     */
    public function show(Cliente $cliente)
    {
        return response()->json([
            'data' => [
                'id' => $cliente->id,
                'nombre' => $cliente->nombre,
                'email' => $cliente->email,
                'telefono' => $cliente->telefono,
                'direccion' => $cliente->direccion,
                'fecha_registro' => $cliente->fecha_registro->toISOString(),
                'total_compras' => (float) $cliente->total_compras,
                'avatar' => $cliente->avatar,
            ]
        ]);
    }

    /**
     * Actualiza el cliente especificado en el almacenamiento.
     */
    public function update(Request $request, Cliente $cliente)
    {
        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:clientes,email,'.$cliente->id,
            'telefono' => 'sometimes|string|max:50',
            'direccion' => 'sometimes|string|max:500',
            'avatar' => 'nullable|string|max:255',
        ]);

        $cliente->update($validated);

        return response()->json([
            'message' => 'Cliente actualizado',
            'data' => [
                'id' => $cliente->id,
                'nombre' => $cliente->nombre,
                'email' => $cliente->email,
                'telefono' => $cliente->telefono,
                'direccion' => $cliente->direccion,
                'fecha_registro' => $cliente->fecha_registro->toISOString(),
                'total_compras' => (float) $cliente->total_compras,
                'avatar' => $cliente->avatar,
            ]
        ]);
    }

    /**
     * Elimina el cliente especificado del almacenamiento.
     */
    public function destroy(Cliente $cliente)
    {
        $cliente->delete();
        return response()->noContent();
    }
}