import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import CategoryManagement from '../CategoryManagement.vue';
import { useCategoryStore } from '../../stores/category';
import { createMockCategory } from '../../tests/utils';

describe('CategoryManagement', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('renders categories list', () => {
        const store = useCategoryStore();
        store.categories = [
            createMockCategory({ id: 1, name: 'Work', color: '#ff0000' }),
            createMockCategory({ id: 2, name: 'Personal', color: '#00ff00' }),
        ];

        const wrapper = mount(CategoryManagement);

        expect(wrapper.text()).toContain('Work');
        expect(wrapper.text()).toContain('Personal');
    });

    it('shows add category form when button is clicked', async () => {
        const wrapper = mount(CategoryManagement);

        const addButton = wrapper.findAll('button').find(btn => btn.text().includes('Add Category'));
        expect(addButton).toBeTruthy();
        await addButton!.trigger('click');

        expect(wrapper.find('input[type="text"]').exists()).toBe(true);
        expect(wrapper.find('input[type="color"]').exists()).toBe(true);
        expect(wrapper.text()).toContain('Cancel');
    });

    it('hides add category form when cancel is clicked', async () => {
        const wrapper = mount(CategoryManagement);

        // Show form
        const addButton = wrapper.findAll('button').find(btn => btn.text().includes('Add Category'));
        await addButton!.trigger('click');
        expect(wrapper.find('input[type="text"]').exists()).toBe(true);

        // Hide form
        const cancelButton = wrapper.findAll('button').find(btn => btn.text().includes('Cancel'));
        await cancelButton!.trigger('click');
        expect(wrapper.find('input[type="text"]').exists()).toBe(false);
    });

    it('calls addCategory when form is submitted', async () => {
        const store = useCategoryStore();
        const addSpy = vi.spyOn(store, 'addCategory').mockResolvedValue(undefined);

        const wrapper = mount(CategoryManagement);

        // Show form
        const addButton = wrapper.findAll('button').find(btn => btn.text().includes('Add Category'));
        await addButton!.trigger('click');

        // Fill form
        await wrapper.find('input[type="text"]').setValue('New Category');
        await wrapper.find('input[type="color"]').setValue('#0000ff');

        // Submit
        const submitButton = wrapper.findAll('button').find(btn => btn.text().includes('Add') && !btn.text().includes('Category'));
        await submitButton!.trigger('click');

        expect(addSpy).toHaveBeenCalledWith('New Category', '#0000ff');
    });

    it('does not submit if category name is empty', async () => {
        const store = useCategoryStore();
        const addSpy = vi.spyOn(store, 'addCategory');

        const wrapper = mount(CategoryManagement);

        // Show form
        const addButton = wrapper.findAll('button').find(btn => btn.text().includes('Add Category'));
        await addButton!.trigger('click');

        // Try to submit without name
        const submitButton = wrapper.findAll('button').find(btn => btn.text().includes('Add') && !btn.text().includes('Category'));
        await submitButton!.trigger('click');

        expect(addSpy).not.toHaveBeenCalled();
    });

    it('resets form after successful category creation', async () => {
        const store = useCategoryStore();
        vi.spyOn(store, 'addCategory').mockResolvedValue(undefined);

        const wrapper = mount(CategoryManagement);

        // Show form
        const addButton = wrapper.findAll('button').find(btn => btn.text().includes('Add Category'));
        await addButton!.trigger('click');

        // Fill and submit
        await wrapper.find('input[type="text"]').setValue('New Category');
        const submitButton = wrapper.findAll('button').find(btn => btn.text().includes('Add') && !btn.text().includes('Category'));
        await submitButton!.trigger('click');
        await wrapper.vm.$nextTick();

        // Form should be hidden
        expect(wrapper.find('input[type="text"]').exists()).toBe(false);
    });

    it('calls deleteCategory when delete button is clicked', async () => {
        const category = createMockCategory({ id: 1, name: 'To Delete' });
        const store = useCategoryStore();
        store.categories = [category];
        const deleteSpy = vi.spyOn(store, 'deleteCategory').mockResolvedValue(undefined);

        const wrapper = mount(CategoryManagement);

        const deleteButton = wrapper.find('button[title="Delete category"]');
        await deleteButton.trigger('click');

        expect(deleteSpy).toHaveBeenCalledWith(1);
    });

    it('emits categoryDeleted event when category is deleted', async () => {
        const category = createMockCategory({ id: 1 });
        const store = useCategoryStore();
        store.categories = [category];
        vi.spyOn(store, 'deleteCategory').mockResolvedValue(undefined);

        const wrapper = mount(CategoryManagement);

        const deleteButton = wrapper.find('button[title="Delete category"]');
        await deleteButton.trigger('click');

        expect(wrapper.emitted('categoryDeleted')).toBeTruthy();
    });

    it('shows loading state when adding category', async () => {
        const store = useCategoryStore();
        store.addingCategory = true;

        const wrapper = mount(CategoryManagement);

        // Show form using the same interaction as users
        const toggleButton = wrapper.findAll('button').find((btn) => btn.text().includes('Add Category'));
        expect(toggleButton).toBeTruthy();
        await toggleButton!.trigger('click');

        expect(wrapper.text()).toContain('Adding...');
        expect(wrapper.find('.animate-spin').exists()).toBe(true);
    });

    it('shows loading state when deleting category', () => {
        const category = createMockCategory({ id: 1 });
        const store = useCategoryStore();
        store.categories = [category];
        store.deletingCategoryIds = new Set([1]);

        const wrapper = mount(CategoryManagement);

        const deleteButton = wrapper.find('button[title*="Deleting"]');
        expect(deleteButton.exists()).toBe(true);
        expect(deleteButton.find('.animate-spin').exists()).toBe(true);
    });

    it('disables delete button when deleting', () => {
        const category = createMockCategory({ id: 1 });
        const store = useCategoryStore();
        store.categories = [category];
        store.deletingCategoryIds = new Set([1]);

        const wrapper = mount(CategoryManagement);

        const deleteButton = wrapper.find('button[disabled]');
        expect(deleteButton.exists()).toBe(true);
    });

    it('renders category with correct color', () => {
        const category = createMockCategory({ 
            id: 1, 
            name: 'Red Category', 
            color: '#ff0000' 
        });
        const store = useCategoryStore();
        store.categories = [category];

        const wrapper = mount(CategoryManagement);

        const categoryElement = wrapper.find('[style*="background-color"]');
        expect(categoryElement.attributes('style')).toContain('#ff0000');
    });
});

