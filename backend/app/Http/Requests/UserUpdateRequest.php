<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserUpdateRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para hacer esta petición.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Obtiene las reglas de validación que se aplican a la petición.
     */
    public function rules(): array
    {
        // Obtenemos la instancia del modelo User que se está actualizando (asumiendo que la ruta es 'users/{user}').
        // Laravel inyecta este modelo si el parámetro de ruta se llama 'user'.
        $user = $this->route('user');

        return [
            // Para una petición PUT, todos los campos necesarios deben ser requeridos (reemplazo completo).
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                // Ignoramos el email del usuario actual ($user) para la validación de unicidad.
                Rule::unique('users', 'email')->ignore($user),
            ],
            // La contraseña es opcional, si se envía, debe ser validada (y confirmada, aunque no se usa aquí).
            'password' => ['nullable', 'string', 'min:8'], // Dejé 'confirmed' fuera ya que no se envió en el curl
            // El rol es requerido y debe existir en la tabla 'roles'.
            'role' => ['required', 'string', Rule::exists('roles', 'name')],
            // El estado 'active' es requerido y debe ser un booleano.
            'active' => ['required', 'boolean'],
            'telefono' => ['nullable', 'string'],
            'direccion' => ['nullable', 'string'],
        ];
    }
}