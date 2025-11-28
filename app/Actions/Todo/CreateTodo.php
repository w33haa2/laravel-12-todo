<?php

namespace App\Actions\Todo;

use App\Models\Todo;
use App\Models\User;

class CreateTodo
{
    /**
     * Create a new todo.
     *
     * @param  User  $user
     * @param  array<string, mixed>  $validated
     * @return Todo
     */
    public function create(User $user, array $validated): Todo
    {
        // Ensure is_complete is set (defaults to false)
        $validated['is_complete'] = $validated['is_complete'] ?? false;

        return $user->todos()->create($validated);
    }
}

