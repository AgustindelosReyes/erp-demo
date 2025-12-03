<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdateRequest;

class UsersController extends Controller
{
    public function index(Request $request)
    {
        $perPage = 20;
        $users = \App\Models\User::with('roles')
            ->select('id','name','email','active')
            ->paginate($perPage);

        $data = $users->through(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
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

    public function store(UserStoreRequest $request)
    {
        $user = User::create($request->validated());
        $user->assignRole($request->role);
        return response()->json($user, 201);
    }

    public function update(UserUpdateRequest $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update($request->validated());
        if ($request->has('role')) {
            $user->syncRoles([$request->role]);
        }
        return response()->json($user);
    }

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

    public function destroy($id)
    {
        if ($id == auth()->id()) {
            abort(403, 'Cannot delete yourself');
        }

        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }
}