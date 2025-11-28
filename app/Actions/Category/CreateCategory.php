<?php

namespace App\Actions\Category;

use App\Models\Category;
use App\Models\User;

class CreateCategory
{
    /**
     * Create a new category.
     *
     * @param  User  $user
     * @param  array<string, mixed>  $validated
     * @return Category
     */
    public function create(User $user, array $validated): Category
    {
        return $user->categories()->create($validated);
    }
}

