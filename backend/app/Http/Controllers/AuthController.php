<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        if (!$user->active) {
            return response()->json(['message' => 'Usuario inactivo'], 403);
        }

        $token = $user->createToken('API Token')->plainTextToken;

        // CORRECCIÓN CLAVE: Cargar la relación 'roles' antes de devolver el usuario.
        $userWithRoles = User::with('roles')->find($user->id);

        return response()->json([
            'user' => $userWithRoles, // Devolvemos el usuario con los roles cargados
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        // CORRECCIÓN CLAVE: Devolvemos el usuario actual con la relación 'roles' cargada.
        // Esto es esencial para que la aplicación frontend sepa los permisos del usuario actual.
        $user = $request->user();
        $user->load('roles'); // Usamos load() en lugar de with() en un objeto ya existente

        return response()->json($user);
    }
}