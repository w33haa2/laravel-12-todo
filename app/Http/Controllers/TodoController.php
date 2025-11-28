<?php

namespace App\Http\Controllers;

use App\Actions\Todo\CreateTodo;
use App\Actions\Todo\UpdateTodo;
use App\Http\Requests\IndexTodoRequest;
use App\Http\Requests\StoreTodoRequest;
use App\Http\Requests\UpdateTodoRequest;
use App\Models\Todo;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TodoController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(IndexTodoRequest $request)
    {
        $query = $request->user()->todos()->with('category');
        $validated = $request->validated();

        // Search
        if ($search = $validated['search'] ?? null) {
            $query->search($search);
        }

        // Filter
        $filters = array_filter([
            'category_id' => $validated['category_id'] ?? null,
            'is_complete' => $validated['is_complete'] ?? null,
        ], fn($value) => $value !== null);
        
        $query->filter($filters);

        // Sort
        $sortBy = $validated['sort_by'] ?? 'created_at';
        $sortOrder = $validated['sort_order'] ?? 'desc';
        
        if ($sortBy === 'due_date') {
            $query->orderByRaw('due_date IS NULL, due_date ' . $sortOrder);
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        return $query->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTodoRequest $request, CreateTodo $createTodo)
    {
        $todo = $createTodo->create($request->user(), $request->validated());
        
        return response()->json($todo->load('category'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Todo $todo)
    {
        $this->authorize('view', $todo);
        
        return $todo->load('category');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTodoRequest $request, Todo $todo, UpdateTodo $updateTodo)
    {
        $this->authorize('update', $todo);

        $todo = $updateTodo->update($todo, $request->user(), $request->validated());

        return $todo->load('category');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Todo $todo)
    {
        $this->authorize('delete', $todo);
        
        $todo->delete();

        return response()->noContent();
    }
}
