<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Integration;

class IntegrationController extends Controller
{
    public function index()
    {
        $integrations = Integration::all();

        return response()->json([
            'data' => $integrations->map(function ($integration) {
                return [
                    'id' => $integration->id,
                    'provider' => $integration->provider,
                    'name' => $integration->name,
                    'status' => $integration->status,
                    'connected_at' => $integration->connected_at,
                ];
            })
        ]);
    }

    public function connect(Request $request, $provider)
    {
        $request->validate([
            'api_key' => 'nullable|string',
            'config' => 'nullable|array',
        ]);

        $integration = Integration::where('provider', $provider)->first();

        if (!$integration) {
            return response()->json(['message' => 'Integración no encontrada'], 404);
        }

        // Simulate connection process
        $integration->update([
            'status' => 'connected',
            'api_key' => $request->api_key,
            'config' => $request->config ? json_encode($request->config) : null,
            'connected_at' => now(),
        ]);

        return response()->json([
            'message' => 'Integración conectada exitosamente',
            'data' => $integration
        ]);
    }

    public function disconnect($provider)
    {
        $integration = Integration::where('provider', $provider)->first();

        if (!$integration) {
            return response()->json(['message' => 'Integración no encontrada'], 404);
        }

        $integration->update([
            'status' => 'disconnected',
            'api_key' => null,
            'config' => null,
            'connected_at' => null,
        ]);

        return response()->json(['message' => 'Integración desconectada']);
    }

    public function getApiKeys()
    {
        // Generate or retrieve API keys for the current user/company
        $apiKey = 'pk_live_' . strtoupper(substr(md5(auth()->id() . now()), 0, 16));

        return response()->json([
            'api_key' => $apiKey
        ]);
    }

    public function regenerateApiKeys()
    {
        // Regenerate API key
        $newApiKey = 'pk_live_' . strtoupper(substr(md5(auth()->id() . now() . rand()), 0, 16));

        // In a real implementation, you would save this to the database
        // For now, we'll just return it

        return response()->json([
            'message' => 'API Key regenerada',
            'api_key' => $newApiKey
        ]);
    }
}
