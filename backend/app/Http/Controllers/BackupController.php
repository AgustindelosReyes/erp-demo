<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\Backup;

class BackupController extends Controller
{
    public function index()
    {
        $backups = Backup::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'data' => $backups->map(function ($backup) {
                return [
                    'id' => $backup->id,
                    'filename' => $backup->filename,
                    'size' => $backup->size,
                    'status' => $backup->status,
                    'type' => $backup->type,
                    'created_at' => $backup->created_at,
                    'user' => $backup->user ? $backup->user->name : 'System',
                ];
            }),
            'pagination' => [
                'total' => $backups->total(),
                'per_page' => $backups->perPage(),
                'current_page' => $backups->currentPage(),
                'last_page' => $backups->lastPage(),
            ],
        ]);
    }

    public function create(Request $request)
    {
        // Simulate backup creation
        $filename = 'backup_' . date('Y_m_d_H_i_s') . '.sql';
        $size = rand(1000000, 5000000); // Random size between 1-5MB

        $backup = Backup::create([
            'filename' => $filename,
            'path' => 'backups/' . $filename,
            'size' => $size,
            'status' => 'completed',
            'type' => 'manual',
            'user_id' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Respaldo creado exitosamente',
            'data' => $backup
        ], 201);
    }

    public function download($id)
    {
        $backup = Backup::findOrFail($id);

        // In a real implementation, you would return the actual file
        // For now, we'll simulate it
        $content = "-- Simulated backup file\n-- Generated on " . now() . "\n";

        return response($content)
            ->header('Content-Type', 'application/sql')
            ->header('Content-Disposition', 'attachment; filename="' . $backup->filename . '"');
    }

    public function restore(Request $request, $id)
    {
        $backup = Backup::findOrFail($id);

        // Simulate restore process
        // In a real implementation, this would execute the SQL file

        return response()->json([
            'message' => 'Restauración completada exitosamente'
        ]);
    }

    public function destroy($id)
    {
        $backup = Backup::findOrFail($id);

        // Delete the backup file if it exists
        if (Storage::exists($backup->path)) {
            Storage::delete($backup->path);
        }

        $backup->delete();

        return response()->noContent();
    }
}
