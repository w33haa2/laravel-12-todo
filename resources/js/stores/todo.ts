import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import type { Category } from './category';

export interface Todo {
    id: number;
    title: string;
    description?: string;
    is_complete: boolean;
    category_id?: number;
    due_date?: string;
    user_id: number;
    category?: Category;
    created_at: string;
    updated_at: string;
}

export const useTodoStore = defineStore('todo', () => {
    const todos = ref<Todo[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const togglingTodoIds = ref<Set<number>>(new Set());
    const deletingTodoIds = ref<Set<number>>(new Set());
    const updatingTodoIds = ref<Set<number>>(new Set());

    const fetchTodos = async (params?: {
        search?: string;
        category_id?: number;
        is_complete?: boolean;
        sort_by?: string;
        sort_order?: string;
    }) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get('/api/todos', { params });
            todos.value = response.data;
        } catch (e) {
            error.value = 'Failed to fetch todos';
            console.error(e);
        } finally {
            loading.value = false;
        }
    };

    const addTodo = async (data: {
        title: string;
        description?: string;
        category_id?: number;
        due_date?: string;
    }) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.post('/api/todos', data);
            todos.value.unshift(response.data);
        } catch (e: any) {
            error.value = e.response?.data?.message || 'Failed to add todo';
            throw e;
        } finally {
            loading.value = false;
        }
    };

    const toggleTodo = async (todo: Todo) => {
        togglingTodoIds.value.add(todo.id);
        error.value = null;
        try {
            const response = await axios.put(`/api/todos/${todo.id}`, {
                is_complete: !todo.is_complete,
            });
            const index = todos.value.findIndex((t) => t.id === todo.id);
            if (index !== -1) {
                todos.value[index] = response.data;
            }
        } catch (e) {
            error.value = 'Failed to update todo';
            console.error(e);
        } finally {
            togglingTodoIds.value.delete(todo.id);
        }
    };

    const updateTodo = async (id: number, data: Partial<Todo>) => {
        updatingTodoIds.value.add(id);
        error.value = null;
        try {
            const response = await axios.put(`/api/todos/${id}`, data);
            const index = todos.value.findIndex((t) => t.id === id);
            if (index !== -1) {
                todos.value[index] = response.data;
            }
        } catch (e) {
            error.value = 'Failed to update todo';
            console.error(e);
        } finally {
            updatingTodoIds.value.delete(id);
        }
    };

    const deleteTodo = async (id: number) => {
        deletingTodoIds.value.add(id);
        error.value = null;
        try {
            await axios.delete(`/api/todos/${id}`);
            todos.value = todos.value.filter((t) => t.id !== id);
        } catch (e) {
            error.value = 'Failed to delete todo';
            console.error(e);
        } finally {
            deletingTodoIds.value.delete(id);
        }
    };

    return {
        todos,
        loading,
        error,
        togglingTodoIds,
        deletingTodoIds,
        updatingTodoIds,
        fetchTodos,
        addTodo,
        toggleTodo,
        updateTodo,
        deleteTodo,
    };
});
