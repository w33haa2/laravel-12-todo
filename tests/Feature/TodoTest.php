<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test-token')->plainTextToken;
    }

    public function test_authenticated_user_can_create_todo(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/todos', [
                'title' => 'Test Todo',
                'description' => 'Test Description',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'title',
                'description',
                'is_complete',
                'user_id',
                'category',
            ]);

        $this->assertDatabaseHas('todos', [
            'title' => 'Test Todo',
            'user_id' => $this->user->id,
        ]);
    }

    public function test_unauthenticated_user_cannot_create_todo(): void
    {
        $response = $this->postJson('/api/todos', [
            'title' => 'Test Todo',
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_list_their_todos(): void
    {
        Todo::factory()->count(3)->create(['user_id' => $this->user->id]);
        Todo::factory()->count(2)->create(); // Other user's todos

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/todos');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_authenticated_user_can_update_todo(): void
    {
        $todo = Todo::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->putJson("/api/todos/{$todo->id}", [
                'title' => 'Updated Title',
                'is_complete' => true,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'title' => 'Updated Title',
                'is_complete' => true,
            ]);

        $this->assertDatabaseHas('todos', [
            'id' => $todo->id,
            'title' => 'Updated Title',
            'is_complete' => true,
        ]);
    }

    public function test_user_cannot_update_other_users_todo(): void
    {
        $otherUser = User::factory()->create();
        $todo = Todo::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->putJson("/api/todos/{$todo->id}", [
                'title' => 'Updated Title',
            ]);

        $response->assertStatus(403);
    }

    public function test_authenticated_user_can_delete_todo(): void
    {
        $todo = Todo::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->deleteJson("/api/todos/{$todo->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('todos', [
            'id' => $todo->id,
        ]);
    }

    public function test_todos_can_be_filtered_by_category(): void
    {
        $category = Category::factory()->create(['user_id' => $this->user->id]);
        
        Todo::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'category_id' => $category->id,
        ]);
        
        Todo::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson("/api/todos?category_id={$category->id}");

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_todos_can_be_searched(): void
    {
        Todo::factory()->create([
            'user_id' => $this->user->id,
            'title' => 'Buy groceries',
        ]);
        
        Todo::factory()->create([
            'user_id' => $this->user->id,
            'title' => 'Clean house',
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/todos?search=groceries');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['title' => 'Buy groceries']);
    }

    public function test_todos_can_be_sorted_by_due_date(): void
    {
        Todo::factory()->create([
            'user_id' => $this->user->id,
            'title' => 'Todo 1',
            'due_date' => '2025-12-01',
        ]);
        
        Todo::factory()->create([
            'user_id' => $this->user->id,
            'title' => 'Todo 2',
            'due_date' => '2025-11-01',
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/todos?sort_by=due_date&sort_order=asc');

        $response->assertStatus(200);
        
        $todos = $response->json();
        $this->assertEquals('Todo 2', $todos[0]['title']);
        $this->assertEquals('Todo 1', $todos[1]['title']);
    }
}
