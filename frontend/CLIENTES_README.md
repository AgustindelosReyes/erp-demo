# Página de Clientes - ERP Demo

Esta documentación describe cómo configurar y usar la página de gestión de clientes en tu proyecto ERP-demo.

## 📁 Estructura de Archivos

Los archivos necesarios para la funcionalidad de clientes se han creado en las siguientes ubicaciones:

### Frontend (Next.js)
- `app/clientes/page.tsx` - Página principal de gestión de clientes
- `components/clientes-table.tsx` - Componente de tabla para mostrar y gestionar clientes
- `hooks/use-clientes.ts` - Hook para manejar las operaciones CRUD con la API

### Configuración
- `.env.example` - Archivo de ejemplo con variables de entorno necesarias

## 🚀 Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del frontend basado en el `.env.example`:

```bash
cp .env.example .env.local
```

Edita el archivo `.env.local` y configura las siguientes variables:

```env
# URL del backend API (Laravel)
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# URL base de la aplicación
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Configuración de autenticación
NEXT_PUBLIC_TOKEN_KEY=auth_token

# Configuración de entorno
NODE_ENV=development
```

### 2. Backend API

Asegúrate de que tu backend Laravel esté configurado para manejar las rutas de clientes. Necesitarás crear:

1. **Rutas API** en `routes/api.php`:
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('clientes', App\Http\Controllers\ClientesController::class);
});
```

2. **Controlador** en `app/Http/Controllers/ClientesController.php`:
```php
<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;

class ClientesController extends Controller
{
    public function index()
    {
        return Cliente::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|email|unique:clientes',
            'telefono' => 'required|string',
            'direccion' => 'required|string',
        ]);

        $cliente = Cliente::create($validated);
        return response()->json($cliente, 201);
    }

    public function update(Request $request, Cliente $cliente)
    {
        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:clientes,email,' . $cliente->id,
            'telefono' => 'sometimes|required|string',
            'direccion' => 'sometimes|required|string',
        ]);

        $cliente->update($validated);
        return response()->json($cliente);
    }

    public function destroy(Cliente $cliente)
    {
        $cliente->delete();
        return response()->json(null, 204);
    }
}
```

3. **Modelo** en `app/Models/Cliente.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'email',
        'telefono',
        'direccion',
        'total_compras',
    ];

    protected $casts = [
        'total_compras' => 'decimal:2',
    ];
}
```

4. **Migración** para crear la tabla de clientes:
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('email')->unique();
            $table->string('telefono');
            $table->string('direccion');
            $table->decimal('total_compras', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('clientes');
    }
};
```

## 🎯 Uso

### Acceder a la Página de Clientes

1. Inicia tu backend Laravel:
```bash
cd backend
php artisan serve
```

2. Inicia tu frontend Next.js:
```bash
cd frontend
npm run dev
```

3. Accede a la página de clientes en tu navegador:
```
http://localhost:3000/clientes
```

### Funcionalidades Disponibles

- **Listado de Clientes**: Visualiza todos los clientes en una tabla organizada
- **Búsqueda**: Busca clientes por nombre, email o teléfono
- **Crear Cliente**: Agrega nuevos clientes al sistema
- **Editar Cliente**: Modifica la información de clientes existentes
- **Eliminar Cliente**: Elimina clientes del sistema

## 🔧 Personalización

### Estilos

Los componentes utilizan Tailwind CSS y los estilos de tu proyecto. Puedes personalizarlos modificando:

- `components/clientes-table.tsx` - Para cambiar el diseño de la tabla
- `app/clientes/page.tsx` - Para modificar el layout general

### Funcionalidades

Puedes extender las funcionalidades modificando:

- `hooks/use-clientes.ts` - Para agregar nuevas operaciones o validaciones
- Los componentes según tus necesidades específicas

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error de CORS**: Asegúrate de que tu backend tenga configurado el middleware de CORS correctamente.

2. **Token de Autenticación**: Verifica que el token de autenticación esté siendo almacenado correctamente en localStorage.

3. **Rutas API**: Confirma que las rutas de la API estén correctamente definidas y que el backend esté en funcionamiento.

### Depuración

Para habilitar el modo de depuración, agrega esto a tu `.env.local`:

```env
NEXT_PUBLIC_DEBUG=true
```

## 📞 Soporte

Si tienes problemas o preguntas sobre la implementación de la página de clientes, consulta esta documentación o contacta al equipo de desarrollo.