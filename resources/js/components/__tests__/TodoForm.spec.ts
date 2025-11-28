import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TodoForm from '../TodoForm.vue';
import { useTodoStore } from '../../stores/todo';
import { useCategoryStore } from '../../stores/category';
import { createMockTodo, createMockCategory } from '../../tests/utils';

describe('TodoForm', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('renders form fields for creating a new todo', () => {
        const wrapper = mount(TodoForm);

        expect(wrapper.find('input[type="text"]').exists()).toBe(true);
        expect(wrapper.find('textarea').exists()).toBe(true);
        expect(wrapper.find('select').exists()).toBe(true);
        expect(wrapper.find('input[type="date"]').exists()).toBe(true);
    });

    it('renders add button when not in edit mode', () => {
        const wrapper = mount(TodoForm);

        expect(wrapper.text()).toContain('Add');
        expect(wrapper.find('button[type="submit"]').text()).toContain('Add');
    });

    it('renders save and cancel buttons when in edit mode', () => {
        const todo = createMockTodo({ title: 'Edit Me' });
        const wrapper = mount(TodoForm, {
            props: { todo },
        });

        expect(wrapper.text()).toContain('Save');
        expect(wrapper.text()).toContain('Cancel');
    });

    it('pre-fills form fields when editing a todo', () => {
        const todo = createMockTodo({
            title: 'Existing Todo',
            description: 'Existing Description',
            category_id: 1,
            due_date: '2024-12-31T00:00:00.000000Z',
        });
        const wrapper = mount(TodoForm, {
            props: { todo },
        });

        const titleInput = wrapper.find('input[type="text"]').element as HTMLInputElement;
        const descriptionInput = wrapper.find('textarea').element as HTMLTextAreaElement;

        expect(titleInput.value).toBe('Existing Todo');
        expect(descriptionInput.value).toBe('Existing Description');
    });

    it('calls addTodo when submitting new todo', async () => {
        const store = useTodoStore();
        const addSpy = vi.spyOn(store, 'addTodo').mockResolvedValue(undefined);

        const wrapper = mount(TodoForm);

        await wrapper.find('input[type="text"]').setValue('New Todo');
        await wrapper.find('form').trigger('submit');

        expect(addSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'New Todo',
            })
        );
    });

    it('calls updateTodo when submitting edited todo', async () => {
        const todo = createMockTodo({ id: 1, title: 'Original Title' });
        const store = useTodoStore();
        const updateSpy = vi.spyOn(store, 'updateTodo').mockResolvedValue(undefined);

        const wrapper = mount(TodoForm, {
            props: { todo },
        });

        await wrapper.find('input[type="text"]').setValue('Updated Title');
        await wrapper.find('form').trigger('submit');

        expect(updateSpy).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                title: 'Updated Title',
            })
        );
    });

    it('emits todoAdded event after successful creation', async () => {
        const store = useTodoStore();
        vi.spyOn(store, 'addTodo').mockResolvedValue(undefined);

        const wrapper = mount(TodoForm);

        await wrapper.find('input[type="text"]').setValue('New Todo');
        await wrapper.find('form').trigger('submit');

        expect(wrapper.emitted('todoAdded')).toBeTruthy();
    });

    it('emits todoUpdated event after successful update', async () => {
        const todo = createMockTodo({ id: 1 });
        const store = useTodoStore();
        vi.spyOn(store, 'updateTodo').mockResolvedValue(undefined);

        const wrapper = mount(TodoForm, {
            props: { todo },
        });

        await wrapper.find('input[type="text"]').setValue('Updated Todo');
        await wrapper.find('form').trigger('submit');

        expect(wrapper.emitted('todoUpdated')).toBeTruthy();
    });

    it('emits cancelled event when cancel button is clicked', async () => {
        const todo = createMockTodo({ id: 1 });
        const wrapper = mount(TodoForm, {
            props: { todo },
        });

        const cancelButton = wrapper.findAll('button').find(btn => btn.text().includes('Cancel'));
        await cancelButton!.trigger('click');

        expect(wrapper.emitted('cancelled')).toBeTruthy();
    });

    it('resets form after successful creation', async () => {
        const store = useTodoStore();
        vi.spyOn(store, 'addTodo').mockResolvedValue(undefined);

        const wrapper = mount(TodoForm);

        await wrapper.find('input[type="text"]').setValue('New Todo');
        await wrapper.find('form').trigger('submit');
        await wrapper.vm.$nextTick();

        const titleInput = wrapper.find('input[type="text"]').element as HTMLInputElement;
        expect(titleInput.value).toBe('');
    });

    it('does not submit if title is empty', async () => {
        const store = useTodoStore();
        const addSpy = vi.spyOn(store, 'addTodo');

        const wrapper = mount(TodoForm);

        await wrapper.find('form').trigger('submit');

        expect(addSpy).not.toHaveBeenCalled();
    });

    it('shows error message when error exists', () => {
        const store = useTodoStore();
        store.error = 'Failed to add todo';

        const wrapper = mount(TodoForm);

        expect(wrapper.text()).toContain('Failed to add todo');
    });

    it('displays categories in select dropdown', () => {
        const categoryStore = useCategoryStore();
        categoryStore.categories = [
            createMockCategory({ id: 1, name: 'Work' }),
            createMockCategory({ id: 2, name: 'Personal' }),
        ];

        const wrapper = mount(TodoForm);

        const select = wrapper.find('select');
        expect(select.text()).toContain('Work');
        expect(select.text()).toContain('Personal');
    });

    it('shows loading state when submitting', async () => {
        const store = useTodoStore();
        store.loading = true;

        const wrapper = mount(TodoForm);

        expect(wrapper.text()).toContain('Adding...');
        expect(wrapper.find('.animate-spin').exists()).toBe(true);
    });

    it('shows saving state when updating', async () => {
        const todo = createMockTodo({ id: 1 });
        const store = useTodoStore();
        store.updatingTodoIds = new Set([1]);

        const wrapper = mount(TodoForm, {
            props: { todo },
        });

        expect(wrapper.text()).toContain('Saving...');
    });
});

