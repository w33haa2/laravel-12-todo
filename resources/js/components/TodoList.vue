<script setup lang="ts">
import { useTodoStore } from '../stores/todo';
import { storeToRefs } from 'pinia';
import TodoItem from './TodoItem.vue';
import { Loader2 } from 'lucide-vue-next';

const todoStore = useTodoStore();
const { todos, loading } = storeToRefs(todoStore);
</script>

<template>
    <div>
        <div v-if="loading" class="text-center py-8 text-gray-500">
            <div class="flex flex-col items-center gap-2">
                <Loader2 class="h-6 w-6 animate-spin text-indigo-600" />
                <span>Loading todos...</span>
            </div>
        </div>

        <div v-else-if="todos.length === 0" class="text-center py-10 text-gray-500">
            No todos found. Add one above!
        </div>

        <ul v-else class="divide-y divide-gray-200">
            <TodoItem
                v-for="todo in todos"
                :key="todo.id"
                :todo="todo"
            />
        </ul>
    </div>
</template>

