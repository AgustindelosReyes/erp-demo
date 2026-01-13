<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Integration;

class IntegrationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $integrations = [
            [
                'provider' => 'mercadopago',
                'name' => 'Mercado Pago',
                'status' => 'connected',
            ],
            [
                'provider' => 'afip',
                'name' => 'AFIP (Facturación Electrónica)',
                'status' => 'disconnected',
            ],
            [
                'provider' => 'whatsapp',
                'name' => 'WhatsApp Business',
                'status' => 'connected',
            ],
            [
                'provider' => 'analytics',
                'name' => 'Google Analytics',
                'status' => 'disconnected',
            ],
        ];

        foreach ($integrations as $integration) {
            Integration::create($integration);
        }
    }
}
