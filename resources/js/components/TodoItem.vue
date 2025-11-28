<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTodoStore } from '../stores/todo';
import { storeToRefs } from 'pinia';
import { CheckCircle, Circle, Trash2, Calendar, Edit2, Loader2 } from 'lucide-vue-next';
import TodoForm from './TodoForm.vue';
import type { Todo } from '../stores/todo';

const props = defineProps<{
    todo: Todo;
}>();

const todoStore = useTodoStore();
const { togglingTodoIds, deletingTodoIds } = storeToRefs(todoStore);
const isEditing = ref(false);

const isToggling = computed(() => togglingTodoIds.value.has(props.todo.id));
const isDeleting = computed(() => deletingTodoIds.value.has(props.todo.id));

const startEdit = () => {
    isEditing.value = true;
};

const formatDate = (date?: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
};

const isOverdue = (date?: string) => {
    if (!date) return false;
    return new Date(date) < new Date() && new Date(date).toDateString() !== new Date().toDateString();
};
</script>

<template>
    <li class="py-4 group">
        <div v-if="!isEditing" class="flex items-start gap-3">
            <button
                @click="todoStore.toggleTodo(todo)"
                :disabled="isToggling || isDeleting"
                class="mt-1 text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Loader2 v-if="isToggling" class="h-6 w-6 animate-spin text-indigo-600" />
                <CheckCircle v-else-if="todo.is_complete" class="h-6 w-6 text-green-500" />
                <Circle v-else class="h-6 w-6" />
            </button>
            
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                    <span
                        class="text-lg"
                        :class="{ 'line-through text-gray-400': todo.is_complete }"
                    >
                        {{ todo.title }}
                    </span>
                    <span
                        v-if="todo.category"
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                        :style="{ backgroundColor: todo.category.color }"
                    >
                        {{ todo.category.name }}
                    </span>
                    <span
                        v-if="todo.due_date"
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                        :class="isOverdue(todo.due_date) ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'"
                    >
                        <Calendar class="h-3 w-3" />
                        {{ formatDate(todo.due_date) }}
                    </span>
                </div>
                <p v-if="todo.description" class="mt-1 text-sm text-gray-600">
                    {{ todo.description }}
                </p>
            </div>

            <div class="flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                <button
                    @click="startEdit"
                    :disabled="isToggling || isDeleting"
                    class="text-gray-400 hover:text-indigo-500 transition-colors focus:outline-none shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Edit todo"
                >
                    <Edit2 class="h-5 w-5" />
                </button>
                <button
                    @click="todoStore.deleteTodo(todo.id)"
                    :disabled="isToggling || isDeleting"
                    class="text-gray-400 hover:text-red-500 transition-colors focus:outline-none shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    :title="isDeleting ? 'Deleting...' : 'Delete todo'"
                >
                    <Loader2 v-if="isDeleting" class="h-5 w-5 animate-spin text-red-500" />
                    <Trash2 v-else class="h-5 w-5" />
                </button>
            </div>
        </div>

        <!-- Edit Form -->
        <TodoForm
            v-else
            :todo="todo"
            :compact="true"
            @todo-updated="isEditing = false"
            @cancelled="isEditing = false"
        />
    </li>
</template>

