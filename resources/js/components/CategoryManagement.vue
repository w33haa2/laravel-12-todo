<script setup lang="ts">
import { ref } from 'vue';
import { useCategoryStore } from '../stores/category';
import { storeToRefs } from 'pinia';
import { Tag, Loader2 } from 'lucide-vue-next';

const categoryStore = useCategoryStore();
const { categories, addingCategory, deletingCategoryIds } = storeToRefs(categoryStore);

const emit = defineEmits<{
    categoryDeleted: [];
}>();

const showCategoryForm = ref(false);
const newCategoryName = ref('');
const newCategoryColor = ref('#3b82f6');

const handleAddCategory = async () => {
    if (!newCategoryName.value.trim()) return;
    
    try {
        await categoryStore.addCategory(newCategoryName.value, newCategoryColor.value);
        newCategoryName.value = '';
        newCategoryColor.value = '#3b82f6';
        showCategoryForm.value = false;
    } catch {
        // Error is handled in the store
    }
};

const handleDeleteCategory = async (id: number) => {
    try {
        await categoryStore.deleteCategory(id);
        emit('categoryDeleted');
    } catch {
        // Error is handled in the store
    }
};

const isDeletingCategory = (id: number) => {
    return deletingCategoryIds.value.has(id);
};
</script>

<template>
    <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Tag class="h-5 w-5" />
                Categories
            </h3>
            <button
                @click="showCategoryForm = !showCategoryForm"
                class="text-sm text-indigo-600 hover:text-indigo-500"
            >
                {{ showCategoryForm ? 'Cancel' : '+ Add Category' }}
            </button>
        </div>

        <div v-if="showCategoryForm" class="mb-4 p-4 bg-gray-50 rounded-md">
            <div class="flex gap-2">
                <input
                    v-model="newCategoryName"
                    type="text"
                    placeholder="Category name"
                    class="flex-1 rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
                <input
                    v-model="newCategoryColor"
                    type="color"
                    class="w-12 h-10 rounded-md border-gray-300 cursor-pointer"
                />
                <button
                    @click="handleAddCategory"
                    :disabled="addingCategory"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <Loader2 v-if="addingCategory" class="h-4 w-4 animate-spin" />
                    <span>{{ addingCategory ? 'Adding...' : 'Add' }}</span>
                </button>
            </div>
        </div>

        <div class="flex flex-wrap gap-2">
            <span
                v-for="category in categories"
                :key="category.id"
                class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white"
                :style="{ backgroundColor: category.color }"
            >
                {{ category.name }}
                <button
                    @click="handleDeleteCategory(category.id)"
                    :disabled="isDeletingCategory(category.id)"
                    class="ml-1 hover:opacity-75 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    :title="isDeletingCategory(category.id) ? 'Deleting...' : 'Delete category'"
                >
                    <Loader2 v-if="isDeletingCategory(category.id)" class="h-3 w-3 animate-spin" />
                    <span v-else>×</span>
                </button>
            </span>
        </div>
    </div>
</template>

