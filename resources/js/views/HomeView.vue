<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTodoStore } from '../stores/todo';
import { useCategoryStore } from '../stores/category';
import CategoryManagement from '../components/CategoryManagement.vue';
import TodoForm from '../components/TodoForm.vue';
import TodoFilters from '../components/TodoFilters.vue';
import TodoList from '../components/TodoList.vue';

const todoStore = useTodoStore();
const categoryStore = useCategoryStore();

const currentFilters = ref<{
    search?: string;
    category_id?: number;
    is_complete?: boolean;
    sort_by: string;
    sort_order: string;
}>({
    sort_by: 'created_at',
    sort_order: 'desc',
});

onMounted(async () => {
    await categoryStore.fetchCategories();
    await todoStore.fetchTodos(currentFilters.value);
});

const handleFiltersChanged = async (filters: {
    search?: string;
    category_id?: number;
    is_complete?: boolean;
    sort_by: string;
    sort_order: string;
}) => {
    currentFilters.value = filters;
    await todoStore.fetchTodos(filters);
};

const handleTodoAdded = async () => {
    // Refetch todos with current filters to maintain proper sorting
    await todoStore.fetchTodos(currentFilters.value);
};
</script>

<template>
    <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
        <CategoryManagement @category-deleted="handleTodoAdded" />
        <TodoForm @todo-added="handleTodoAdded" />
        <TodoFilters @filters-changed="handleFiltersChanged" />
        <TodoList />
    </div>
</template>
