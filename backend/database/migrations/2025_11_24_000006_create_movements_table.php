<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('movements', function (Blueprint $table) {
            $table->id();

            // Usuario que ejecutó el movimiento
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Producto afectado
            $table->foreignId('product_id')->constrained()->onDelete('cascade');

            // Cantidad movida
            $table->integer('quantity');

            // Estado del movimiento
            $table->enum('status', ['pendiente','completado'])->default('pendiente');

            // Tipo de movimiento
            $table->enum('movement_type', ['venta','entrada','ajuste'])->default('venta');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movements');
    }
};
