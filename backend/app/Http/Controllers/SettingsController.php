<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingsController extends Controller
{
    public function getCompanySettings()
    {
        $settings = DB::table('settings')
            ->where('group', 'company')
            ->pluck('value', 'key')
            ->toArray();

        return response()->json([
            'name' => $settings['company_name'] ?? 'Pinturería Taragüí',
            'email' => $settings['company_email'] ?? 'info@taragui.com',
            'phone' => $settings['company_phone'] ?? '+54 379 4567890',
            'address' => $settings['company_address'] ?? 'Av. 3 de Abril 1234, Corrientes',
            'cuit' => $settings['company_cuit'] ?? '',
            'logo_path' => $settings['company_logo_path'] ?? null,
        ]);
    }

    public function updateCompanySettings(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'cuit' => 'nullable|string|max:20',
        ]);

        $settings = [
            'company_name' => $request->name,
            'company_email' => $request->email,
            'company_phone' => $request->phone,
            'company_address' => $request->address,
            'company_cuit' => $request->cuit,
        ];

        foreach ($settings as $key => $value) {
            DB::table('settings')->updateOrInsert(
                ['key' => $key],
                [
                    'value' => $value,
                    'type' => 'string',
                    'group' => 'company',
                    'description' => 'Company ' . str_replace('company_', '', $key),
                    'updated_at' => now()
                ]
            );
        }

        return response()->json(['message' => 'Configuración de empresa actualizada']);
    }

    public function getSystemSettings()
    {
        $settings = DB::table('settings')
            ->where('group', 'system')
            ->pluck('value', 'key')
            ->toArray();

        return response()->json([
            'language' => $settings['language'] ?? 'es',
            'timezone' => $settings['timezone'] ?? 'America/Argentina/Buenos_Aires',
            'currency' => $settings['currency'] ?? 'ARS',
            'date_format' => $settings['date_format'] ?? 'dd/mm/yyyy',
        ]);
    }

    public function updateSystemSettings(Request $request)
    {
        $request->validate([
            'language' => 'required|string|in:es,en,pt',
            'timezone' => 'required|string',
            'currency' => 'required|string|in:ARS,USD,EUR,BRL',
            'date_format' => 'required|string|in:dd/mm/yyyy,mm/dd/yyyy,yyyy-mm-dd',
        ]);

        $settings = [
            'language' => $request->language,
            'timezone' => $request->timezone,
            'currency' => $request->currency,
            'date_format' => $request->date_format,
        ];

        foreach ($settings as $key => $value) {
            DB::table('settings')->updateOrInsert(
                ['key' => $key],
                [
                    'value' => $value,
                    'type' => 'string',
                    'group' => 'system',
                    'description' => 'System ' . $key,
                    'updated_at' => now()
                ]
            );
        }

        return response()->json(['message' => 'Configuración del sistema actualizada']);
    }

    public function getBillingSettings()
    {
        $settings = DB::table('settings')
            ->where('group', 'billing')
            ->pluck('value', 'key')
            ->toArray();

        return response()->json([
            'invoice_prefix' => $settings['invoice_prefix'] ?? 'FAC',
            'invoice_number' => (int)($settings['invoice_number'] ?? 1000),
            'payment_terms' => (int)($settings['payment_terms'] ?? 30),
            'tax_rate' => (float)($settings['tax_rate'] ?? 21),
            'include_logo' => $settings['include_logo'] === 'true',
            'auto_email' => $settings['auto_email'] === 'true',
            'electronic_billing' => $settings['electronic_billing'] === 'true',
        ]);
    }

    public function updateBillingSettings(Request $request)
    {
        $request->validate([
            'invoice_prefix' => 'required|string|max:10',
            'invoice_number' => 'required|integer|min:1',
            'payment_terms' => 'required|integer|min:0',
            'tax_rate' => 'required|numeric|min:0|max:100',
            'include_logo' => 'boolean',
            'auto_email' => 'boolean',
            'electronic_billing' => 'boolean',
        ]);

        $settings = [
            'invoice_prefix' => $request->invoice_prefix,
            'invoice_number' => (string)$request->invoice_number,
            'payment_terms' => (string)$request->payment_terms,
            'tax_rate' => (string)$request->tax_rate,
            'include_logo' => $request->include_logo ? 'true' : 'false',
            'auto_email' => $request->auto_email ? 'true' : 'false',
            'electronic_billing' => $request->electronic_billing ? 'true' : 'false',
        ];

        foreach ($settings as $key => $value) {
            DB::table('settings')->updateOrInsert(
                ['key' => $key],
                [
                    'value' => $value,
                    'type' => is_numeric($value) ? 'number' : 'boolean',
                    'group' => 'billing',
                    'description' => 'Billing ' . str_replace('_', ' ', $key),
                    'updated_at' => now()
                ]
            );
        }

        return response()->json(['message' => 'Configuración de facturación actualizada']);
    }

    public function getNotificationSettings()
    {
        $userId = auth()->id();
        $settings = DB::table('settings')
            ->where('group', 'notifications')
            ->where('key', 'like', "user_{$userId}_%")
            ->pluck('value', 'key')
            ->toArray();

        return response()->json([
            'email_notifications' => $settings["user_{$userId}_email_notifications"] === 'true',
            'low_stock_alerts' => $settings["user_{$userId}_low_stock_alerts"] === 'true',
            'sales_notifications' => $settings["user_{$userId}_sales_notifications"] === 'true',
            'system_updates' => $settings["user_{$userId}_system_updates"] === 'true',
        ]);
    }

    public function updateNotificationSettings(Request $request)
    {
        $request->validate([
            'email_notifications' => 'boolean',
            'low_stock_alerts' => 'boolean',
            'sales_notifications' => 'boolean',
            'system_updates' => 'boolean',
        ]);

        $userId = auth()->id();
        $settings = [
            "user_{$userId}_email_notifications" => $request->email_notifications ? 'true' : 'false',
            "user_{$userId}_low_stock_alerts" => $request->low_stock_alerts ? 'true' : 'false',
            "user_{$userId}_sales_notifications" => $request->sales_notifications ? 'true' : 'false',
            "user_{$userId}_system_updates" => $request->system_updates ? 'true' : 'false',
        ];

        foreach ($settings as $key => $value) {
            DB::table('settings')->updateOrInsert(
                ['key' => $key],
                [
                    'value' => $value,
                    'type' => 'boolean',
                    'group' => 'notifications',
                    'description' => 'User notification preference',
                    'updated_at' => now()
                ]
            );
        }

        return response()->json(['message' => 'Preferencias de notificaciones actualizadas']);
    }

    public function getBackupSettings()
    {
        $settings = DB::table('settings')
            ->where('group', 'backup')
            ->pluck('value', 'key')
            ->toArray();

        return response()->json([
            'auto_backup' => $settings['auto_backup'] === 'true',
            'backup_time' => $settings['backup_time'] ?? '03:00',
            'retention_days' => (int)($settings['retention_days'] ?? 30),
        ]);
    }

    public function updateBackupSettings(Request $request)
    {
        $request->validate([
            'auto_backup' => 'boolean',
            'backup_time' => 'required|date_format:H:i',
            'retention_days' => 'required|integer|min:1|max:365',
        ]);

        $settings = [
            'auto_backup' => $request->auto_backup ? 'true' : 'false',
            'backup_time' => $request->backup_time,
            'retention_days' => (string)$request->retention_days,
        ];

        foreach ($settings as $key => $value) {
            DB::table('settings')->updateOrInsert(
                ['key' => $key],
                [
                    'value' => $value,
                    'type' => is_numeric($value) ? 'number' : 'boolean',
                    'group' => 'backup',
                    'description' => 'Backup ' . str_replace('_', ' ', $key),
                    'updated_at' => now()
                ]
            );
        }

        return response()->json(['message' => 'Configuración de respaldos actualizada']);
    }
}
