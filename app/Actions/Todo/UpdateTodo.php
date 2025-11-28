<?php

namespace App\Actions\Todo;

use App\Models\Todo;
use App\Models\User;

class UpdateTodo
{
    /**
     * Update an existing todo.
     *
     * @param  Todo  $todo
     * @param  User  $user
     * @param  array<string, mixed>  $validated
     * @return Todo
     */
    public function update(Todo $todo, User $user, array $validated): Todo
    {
        $todo->update($validated);

        return $todo->fresh();
    }
}

