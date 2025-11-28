import axios from 'axios';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Category {
    id: number;
    name: string;
    color: string;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export const useCategoryStore = defineStore('category', () => {
    const categories = ref<Category[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const addingCategory = ref(false);
    const deletingCategoryIds = ref<Set<number>>(new Set());

    const fetchCategories = async () => {
        loading.value = true;
        try {
            const response = await axios.get('/api/categories');
            categories.value = response.data;
        } catch (e) {
            error.value = 'Failed to fetch categories';
            console.error(e);
        } finally {
            loading.value = false;
        }
    };

    const addCategory = async (name: string, color: string = '#3b82f6') => {
        addingCategory.value = true;
        error.value = null;
        try {
            const response = await axios.post('/api/categories', { name, color });
            categories.value.unshift(response.data);
        } catch (e) {
            error.value = 'Failed to add category';
            console.error(e);
            throw e;
        } finally {
            addingCategory.value = false;
        }
    };

    const deleteCategory = async (id: number) => {
        deletingCategoryIds.value.add(id);
        error.value = null;
        try {
            await axios.delete(`/api/categories/${id}`);
            categories.value = categories.value.filter((c) => c.id !== id);
        } catch (e) {
            error.value = 'Failed to delete category';
            console.error(e);
            throw e;
        } finally {
            deletingCategoryIds.value.delete(id);
        }
    };

    return {
        categories,
        loading,
        error,
        addingCategory,
        deletingCategoryIds,
        fetchCategories,
        addCategory,
        deleteCategory,
    };
});
