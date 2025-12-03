<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;
use Illuminate\Support\Facades\Hash; 
use Illuminate\Support\Facades\Auth; 
use Illuminate\Support\Facades\Log; 

class UsersController extends Controller
{
    /**
     * Muestra una lista paginada de usuarios con sus roles.
     * GET /api/users
     */
    public function index(Request $request)
    {
        $perPage = 20;
        $users = User::with('roles')
            ->select('id','name','email','active')
            ->paginate($perPage);

        $data = $users->through(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                // Extrae el primer rol o null si no tiene
                'role' => $user->roles->first()?->name ?? null, 
                'active' => (bool) $user->active,
            ];
        });

        return response()->json([
            'data' => $data->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ]
        ]);
    }

    /**
     * Almacena un nuevo usuario.
     */
    public function store(UserStoreRequest $request)
    {
        $data = $request->validated();
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']), 
            'active' => $data['active'],
        ]);
        $user->assignRole($data['role']);
        
        // Recargar para obtener el rol en la respuesta
        $user->refresh()->load('roles');

        return response()->json([
            'message' => 'Usuario creado',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->first()?->name,
                'active' => (bool) $user->active,
            ]
        ], 201);
    }

    /**
     * Actualiza el usuario especificado en el almacenamiento.
     */
    public function update(UserUpdateRequest $request, $id) // FIX: Cambiamos User $user a $id
    {
        // FIX: Buscamos el usuario explícitamente para evitar fallos en Route Model Binding
        $user = User::findOrFail($id); 

        $data = $request->validated();
        
        // Asignación directa de propiedades antes de guardar
        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->active = (bool) $data['active']; 

        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        // LOGGING: Registra los datos antes de guardar
        Log::info("Intentando actualizar usuario ID: {$user->id} via save()", [
            'name' => $user->name,
            'email' => $user->email,
            'active' => $user->active,
        ]);
        
        // 2. Guardar el modelo - Esto registrará correctamente los cambios (UPDATE)
        $user->save(); 

        // 3. Actualizar el rol
        if (!empty($data['role'])) {
            // syncRoles asegura que el usuario SOLO tenga este rol
            $user->syncRoles([$data['role']]);
        }
        
        // Recargar el modelo y sus relaciones para la respuesta.
        $user->refresh();
        $user->load('roles'); 

        Log::info("Usuario ID {$user->id} después de refresh/load", [
            'name' => $user->name,
            'email' => $user->email,
            'active' => $user->active,
            'role' => $user->roles->first()?->name ?? 'N/A'
        ]);
        
        return response()->json([
            'message' => 'Usuario actualizado', 
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->first()?->name,
                'active' => (bool) $user->active,
            ]
        ]);
    }

    /**
     * Actualiza solo el estado de actividad del usuario.
     */
    public function updateActive(Request $request, $id)
    {
        $request->validate([
            'active' => 'required|boolean'
        ]);

        $user = User::findOrFail($id);
        $user->active = $request->active;
        $user->save();
        return response()->json($user);
    }

    /**
     * Elimina el usuario especificado del almacenamiento.
     */
    public function destroy(User $user)
    {
        // Regla de Negocio: Evitar que un usuario se elimine a sí mismo
        if ($user->id === Auth::id()) {
            return response()->json([
                'message' => 'No puedes eliminar al usuario autenticado.',
            ], 403);
        }

        $user->delete();
        
        return response()->json(['message' => 'Usuario eliminado']);
    }
}