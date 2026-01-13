<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

class SessionController extends Controller
{
    public function index()
    {
        // Get active sessions for the current user
        // In a real implementation, you would track sessions in the database
        // For now, we'll simulate some sessions

        $sessions = [
            [
                'id' => 1,
                'device' => 'Chrome en Windows',
                'browser' => 'Chrome',
                'ip_address' => '192.168.1.100',
                'location' => 'Corrientes, Argentina',
                'last_activity' => now(),
                'current' => true,
            ],
            [
                'id' => 2,
                'device' => 'Safari en iPhone',
                'browser' => 'Safari',
                'ip_address' => '192.168.1.101',
                'location' => 'Corrientes, Argentina',
                'last_activity' => now()->subHours(2),
                'current' => false,
            ],
        ];

        return response()->json([
            'data' => $sessions
        ]);
    }

    public function destroy($id)
    {
        // In a real implementation, you would invalidate the specific session
        // For now, we'll just simulate it

        return response()->json(['message' => 'Sesión cerrada exitosamente']);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = auth()->user();

        // Check current password
        if (!password_verify($request->current_password, $user->password)) {
            return response()->json(['message' => 'Contraseña actual incorrecta'], 422);
        }

        // Update password
        $user->password = bcrypt($request->password);
        $user->save();

        return response()->json(['message' => 'Contraseña cambiada exitosamente']);
    }

    public function enableTwoFactor()
    {
        $user = auth()->user();
        $user->two_factor_enabled = true;
        // In a real implementation, generate and return QR code
        $user->two_factor_secret = 'simulated_secret_' . rand(1000, 9999);
        $user->save();

        return response()->json([
            'message' => 'Autenticación de dos factores habilitada',
            'secret' => $user->two_factor_secret
        ]);
    }

    public function disableTwoFactor()
    {
        $user = auth()->user();
        $user->two_factor_enabled = false;
        $user->two_factor_secret = null;
        $user->save();

        return response()->json(['message' => 'Autenticación de dos factores deshabilitada']);
    }
}
