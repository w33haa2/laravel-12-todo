<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useCategoryStore } from '../stores/category';
import { storeToRefs } from 'pinia';
import { Search, Filter } from 'lucide-vue-next';

const categoryStore = useCategoryStore();
const { categories } = storeToRefs(categoryStore);

const searchQuery = ref('');
const filterCategoryId = ref<number | undefined>();
const filterStatus = ref<'all' | 'active' | 'completed'>('all');
const sortBy = ref<'created_at' | 'due_date'>('created_at');
const sortOrder = ref<'asc' | 'desc'>('desc');

const emit = defineEmits<{
    filtersChanged: [filters: {
        search?: string;
        category_id?: number;
        is_complete?: boolean;
        sort_by: string;
        sort_order: string;
    }];
}>();

const updateFilters = () => {
    const params: any = {
        sort_by: sortBy.value,
        sort_order: sortOrder.value,
    };

    if (searchQuery.value) {
        params.search = searchQuery.value;
    }

    if (filterCategoryId.value) {
        params.category_id = filterCategoryId.value;
    }

    if (filterStatus.value !== 'all') {
        params.is_complete = filterStatus.value === 'completed';
    }

    emit('filtersChanged', params);
};

// Watch filters and emit changes
watch([searchQuery, filterCategoryId, filterStatus, sortBy, sortOrder], () => {
    updateFilters();
}, { debounce: 300 } as any);

// Emit initial filters on mount
onMounted(() => {
    updateFilters();
});
</script>

<template>
    <div class="mb-6 p-4 bg-gray-50 rounded-md">
        <div class="flex items-center gap-2 mb-3">
            <Filter class="h-5 w-5 text-gray-500" />
            <span class="font-medium text-gray-700">Filters</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div class="relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search todos..."
                    class="w-full pl-10 rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
            </div>
            <select
                v-model="filterCategoryId"
                class="rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
                <option :value="undefined">All categories</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                </option>
            </select>
            <select
                v-model="filterStatus"
                class="rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
                <option value="all">All todos</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
            </select>
            <select
                v-model="sortBy"
                class="rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
                <option value="created_at">Sort by: Created</option>
                <option value="due_date">Sort by: Due Date</option>
            </select>
        </div>
    </div>
</template>

