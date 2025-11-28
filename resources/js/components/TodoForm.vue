<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useTodoStore } from '../stores/todo';
import { useCategoryStore } from '../stores/category';
import { storeToRefs } from 'pinia';
import { Plus, Check, X, Loader2 } from 'lucide-vue-next';
import type { Todo } from '../stores/todo';

const props = withDefaults(defineProps<{
    todo?: Todo;
    compact?: boolean;
}>(), {
    todo: undefined,
    compact: false,
});

const todoStore = useTodoStore();
const categoryStore = useCategoryStore();
const { loading, error, updatingTodoIds } = storeToRefs(todoStore);
const { categories } = storeToRefs(categoryStore);

const isUpdating = computed(() => {
    if (!props.todo) return false;
    return updatingTodoIds.value.has(props.todo.id);
});

const isSubmitting = computed(() => loading.value || isUpdating.value);

const isEditMode = computed(() => !!props.todo);

const title = ref('');
const description = ref('');
const selectedCategoryId = ref<number | undefined>();
const dueDate = ref('');

const emit = defineEmits<{
    todoAdded: [];
    todoUpdated: [];
    cancelled: [];
}>();

const resetForm = () => {
    title.value = '';
    description.value = '';
    selectedCategoryId.value = undefined;
    dueDate.value = '';
};

// Initialize form with todo data if in edit mode
watch(() => props.todo, (todo) => {
    if (todo) {
        title.value = todo.title;
        description.value = todo.description || '';
        dueDate.value = todo.due_date ? todo.due_date.split('T')[0] : '';
        selectedCategoryId.value = !todo.category_id ? undefined : todo.category_id;
    } else {
        resetForm();
    }
}, { immediate: true });

const handleSubmit = async () => {
    if (!title.value.trim()) return;
    
    try {
        if (isEditMode.value && props.todo) {
            await todoStore.updateTodo(props.todo.id, {
                title: title.value,
                description: description.value || undefined,
                category_id: selectedCategoryId.value,
                due_date: dueDate.value || undefined,
            });
            emit('todoUpdated');
        } else {
            await todoStore.addTodo({
                title: title.value,
                description: description.value || undefined,
                category_id: selectedCategoryId.value,
                due_date: dueDate.value || undefined,
            });
            resetForm();
            emit('todoAdded');
        }
    } catch (e) {
        // Error is handled in the store
    }
};

const handleCancel = () => {
    if (isEditMode.value) {
        // Reset to original values
        if (props.todo) {
            title.value = props.todo.title;
            description.value = props.todo.description || '';
            selectedCategoryId.value = props.todo.category_id;
            dueDate.value = props.todo.due_date ? props.todo.due_date.split('T')[0] : '';
        }
        emit('cancelled');
    } else {
        resetForm();
    }
};
</script>

<template>
    <div :class="compact ? 'p-4 bg-gray-50 rounded-md border border-indigo-200' : 'mb-6 p-4 bg-gray-50 rounded-md'">
        <div v-if="error" class="mb-3 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {{ error }}
        </div>
        <form @submit.prevent="handleSubmit" class="space-y-3">
            <input
                v-model="title"
                type="text"
                :placeholder="isEditMode ? 'Title' : 'What needs to be done?'"
                required
                class="w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
            <textarea
                v-model="description"
                placeholder="Description (optional)"
                rows="2"
                class="w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            ></textarea>
            <div class="flex gap-3">
                <select
                    v-model="selectedCategoryId"
                    class="flex-1 rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                >
                    <option :value="undefined">No category</option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                        {{ category.name }}
                    </option>
                </select>
                <input
                    v-model="dueDate"
                    type="date"
                    class="flex-1 rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
                <template v-if="!isEditMode">
                    <button
                        type="submit"
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="isSubmitting"
                    >
                        <Loader2 v-if="loading" class="h-5 w-5 mr-2 animate-spin" />
                        <Plus v-else class="h-5 w-5 mr-2" />
                        {{ loading ? 'Adding...' : 'Add' }}
                    </button>
                </template>
            </div>
            <div v-if="isEditMode" class="flex gap-2 justify-end">
                <button
                    type="button"
                    @click="handleCancel"
                    class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                    <X class="h-4 w-4 mr-1" />
                    Cancel
                </button>
                <button
                    type="submit"
                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isSubmitting"
                >
                    <Loader2 v-if="isUpdating" class="h-4 w-4 mr-1 animate-spin" />
                    <Check v-else class="h-4 w-4 mr-1" />
                    {{ isUpdating ? 'Saving...' : 'Save' }}
                </button>
            </div>
        </form>
    </div>
</template>

