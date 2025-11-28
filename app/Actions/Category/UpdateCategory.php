<?php

namespace App\Actions\Category;

use App\Models\Category;
use App\Models\User;

class UpdateCategory
{
    /**
     * Update an existing category.
     *
     * @param  Category  $category
     * @param  User  $user
     * @param  array<string, mixed>  $validated
     * @return Category
     */
    public function update(Category $category, User $user, array $validated): Category
    {
        $category->update($validated);

        return $category->fresh();
    }
}

