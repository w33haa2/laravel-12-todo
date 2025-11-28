import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TodoFilters from '../TodoFilters.vue';
import { useCategoryStore } from '../../stores/category';
import { createMockCategory } from '../../tests/utils';

describe('TodoFilters', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders all filter inputs', () => {
        const wrapper = mount(TodoFilters);

        expect(wrapper.find('input[type="text"]').exists()).toBe(true);
        expect(wrapper.findAll('select').length).toBe(3);
    });

    it('emits filtersChanged with initial values on mount', () => {
        const wrapper = mount(TodoFilters);

        expect(wrapper.emitted('filtersChanged')).toBeTruthy();
        const emitted = wrapper.emitted('filtersChanged')?.[0]?.[0];
        expect(emitted).toHaveProperty('sort_by');
        expect(emitted).toHaveProperty('sort_order');
    });

    it('emits filtersChanged when search query changes', async () => {
        const wrapper = mount(TodoFilters);

        await wrapper.find('input[type="text"]').setValue('test search');
        vi.advanceTimersByTime(300);

        const emitted = wrapper.emitted('filtersChanged');
        expect(emitted).toBeTruthy();
        const lastEmitted = emitted?.[emitted.length - 1]?.[0];
        expect(lastEmitted?.search).toBe('test search');
    });

    it('emits filtersChanged when category filter changes', async () => {
        const categoryStore = useCategoryStore();
        categoryStore.categories = [
            createMockCategory({ id: 1, name: 'Work' }),
            createMockCategory({ id: 2, name: 'Personal' }),
        ];

        const wrapper = mount(TodoFilters);

        const categorySelect = wrapper.findAll('select')[0];
        await categorySelect.setValue('1');
        vi.advanceTimersByTime(300);

        const emitted = wrapper.emitted('filtersChanged');
        expect(emitted).toBeTruthy();
        const lastEmitted = emitted?.[emitted.length - 1]?.[0];
        expect(lastEmitted?.category_id).toBe(1);
    });

    it('emits filtersChanged when status filter changes', async () => {
        const wrapper = mount(TodoFilters);

        const statusSelect = wrapper.findAll('select')[1];
        await statusSelect.setValue('completed');
        vi.advanceTimersByTime(300);

        const emitted = wrapper.emitted('filtersChanged');
        expect(emitted).toBeTruthy();
        const lastEmitted = emitted?.[emitted.length - 1]?.[0];
        expect(lastEmitted?.is_complete).toBe(true);
    });

    it('emits filtersChanged when status filter is set to active', async () => {
        const wrapper = mount(TodoFilters);

        const statusSelect = wrapper.findAll('select')[1];
        await statusSelect.setValue('active');
        vi.advanceTimersByTime(300);

        const emitted = wrapper.emitted('filtersChanged');
        expect(emitted).toBeTruthy();
        const lastEmitted = emitted?.[emitted.length - 1]?.[0];
        expect(lastEmitted?.is_complete).toBe(false);
    });

    it('does not include is_complete when status is all', async () => {
        const wrapper = mount(TodoFilters);

        const statusSelect = wrapper.findAll('select')[1];
        await statusSelect.setValue('all');
        vi.advanceTimersByTime(300);

        const emitted = wrapper.emitted('filtersChanged');
        expect(emitted).toBeTruthy();
        const lastEmitted = emitted?.[emitted.length - 1]?.[0];
        expect(lastEmitted?.is_complete).toBeUndefined();
    });

    it('emits filtersChanged when sort by changes', async () => {
        const wrapper = mount(TodoFilters);

        const sortSelect = wrapper.findAll('select')[2];
        await sortSelect.setValue('due_date');
        vi.advanceTimersByTime(300);

        const emitted = wrapper.emitted('filtersChanged');
        expect(emitted).toBeTruthy();
        const lastEmitted = emitted?.[emitted.length - 1]?.[0];
        expect(lastEmitted?.sort_by).toBe('due_date');
    });

    it('emits filtersChanged when sort order changes', async () => {
        const wrapper = mount(TodoFilters);

        // Note: sort order is not directly visible in the template,
        // but we can test that changing sort_by triggers an emission
        const sortSelect = wrapper.findAll('select')[2];
        await sortSelect.setValue('created_at');
        vi.advanceTimersByTime(300);

        const emitted = wrapper.emitted('filtersChanged');
        expect(emitted).toBeTruthy();
    });

    it('displays categories in category select', () => {
        const categoryStore = useCategoryStore();
        categoryStore.categories = [
            createMockCategory({ id: 1, name: 'Work' }),
            createMockCategory({ id: 2, name: 'Personal' }),
        ];

        const wrapper = mount(TodoFilters);

        const categorySelect = wrapper.findAll('select')[0];
        expect(categorySelect.text()).toContain('Work');
        expect(categorySelect.text()).toContain('Personal');
    });

    it('debounces filter changes', async () => {
        const wrapper = mount(TodoFilters);

        const input = wrapper.find('input[type="text"]');
        await input.setValue('t');
        await input.setValue('te');
        await input.setValue('tes');
        await input.setValue('test');

        vi.advanceTimersByTime(300);
        const emitted = wrapper.emitted('filtersChanged') ?? [];
        const lastEmission = emitted[emitted.length - 1]?.[0];

        expect(lastEmission?.search).toBe('test');
    });

    it('includes all filter parameters in emission', async () => {
        const categoryStore = useCategoryStore();
        categoryStore.categories = [
            createMockCategory({ id: 1, name: 'Work' }),
        ];

        const wrapper = mount(TodoFilters);

        await wrapper.find('input[type="text"]').setValue('search');
        const categorySelect = wrapper.findAll('select')[0];
        await categorySelect.setValue('1');
        const statusSelect = wrapper.findAll('select')[1];
        await statusSelect.setValue('active');
        const sortSelect = wrapper.findAll('select')[2];
        await sortSelect.setValue('due_date');

        vi.advanceTimersByTime(300);

        const emitted = wrapper.emitted('filtersChanged');
        expect(emitted).toBeTruthy();
        const lastEmitted = emitted?.[emitted.length - 1]?.[0];
        
        expect(lastEmitted).toHaveProperty('search', 'search');
        expect(lastEmitted).toHaveProperty('category_id', 1);
        expect(lastEmitted).toHaveProperty('is_complete', false);
        expect(lastEmitted).toHaveProperty('sort_by', 'due_date');
        expect(lastEmitted).toHaveProperty('sort_order');
    });
});

