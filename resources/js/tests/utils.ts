import { createPinia, setActivePinia } from 'pinia';
import { beforeEach } from 'vitest';
import type { Todo } from '../stores/todo';
import type { Category } from '../stores/category';

// Create a fresh Pinia instance for each test
export function createTestPinia() {
    const pinia = createPinia();
    setActivePinia(pinia);
    return pinia;
}

// Helper to create mock todos
export function createMockTodo(overrides?: Partial<Todo>): Todo {
    return {
        id: 1,
        title: 'Test Todo',
        description: 'Test description',
        is_complete: false,
        category_id: undefined,
        due_date: undefined,
        user_id: 1,
        created_at: '2024-01-01T00:00:00.000000Z',
        updated_at: '2024-01-01T00:00:00.000000Z',
        ...overrides,
    };
}

// Helper to create mock categories
export function createMockCategory(overrides?: Partial<Category>): Category {
    return {
        id: 1,
        name: 'Test Category',
        color: '#3b82f6',
        user_id: 1,
        created_at: '2024-01-01T00:00:00.000000Z',
        updated_at: '2024-01-01T00:00:00.000000Z',
        ...overrides,
    };
}

// Setup function for tests that need Pinia
export function setupPinia() {
    beforeEach(() => {
        createTestPinia();
    });
}

