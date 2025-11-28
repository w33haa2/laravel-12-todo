import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TodoItem from '../TodoItem.vue';
import { useTodoStore } from '../../stores/todo';
import { createMockTodo, createMockCategory } from '../../tests/utils';

describe('TodoItem', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('renders todo title', () => {
        const todo = createMockTodo({ title: 'Test Todo Item' });
        const wrapper = mount(TodoItem, {
            props: { todo },
        });

        expect(wrapper.text()).toContain('Test Todo Item');
    });

    it('renders completed todo with line-through', () => {
        const todo = createMockTodo({ 
            title: 'Completed Todo',
            is_complete: true,
        });
        const wrapper = mount(TodoItem, {
            props: { todo },
        });

        const titleElement = wrapper.find('.line-through');
        expect(titleElement.exists()).toBe(true);
        expect(titleElement.text()).toContain('Completed Todo');
    });

    it('renders incomplete todo without line-through', () => {
        const todo = createMockTodo({ 
            title: 'Incomplete Todo',
            is_complete: false,
        });
        const wrapper = mount(TodoItem, {
            props: { todo },
        });

        const titleElement = wrapper.find('.line-through');
        expect(titleElement.exists()).toBe(false);
    });

    it('renders description when provided', () => {
        const todo = createMockTodo({ 
            title: 'Todo with Description',
            description: 'This is a description',
        });
        const wrapper = mount(TodoItem, {
            props: { todo },
        });

        expect(wrapper.text()).toContain('This is a description');
    });

    it('renders category badge when category exists', () => {
        const category = createMockCategory({ name: 'Work', color: '#ff0000' });
        const todo = createMockTodo({ 
            title: 'Todo with Category',
            category,
            category_id: category.id,
        });
        const wrapper = mount(TodoItem, {
            props: { todo },
        });

        expect(wrapper.text()).toContain('Work');
        const badge = wrapper.find('[style*="background-color"]');
        expect(badge.exists()).toBe(true);
    });

    it('renders due date when provided', () => {
        const dateSpy = vi.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('Dec 31, 2024');
        const todo = createMockTodo({ 
            title: 'Todo with Due Date',
            due_date: '2024-12-31T00:00:00.000000Z',
            description: 'Test description',
        });
        const wrapper = mount(TodoItem, {
            props: { todo },
        });

        expect(wrapper.text()).toContain('Dec 31, 2024');
        expect(wrapper.find('[class*="lucide-calendar-icon"]').exists()).toBe(true);

        dateSpy.mockRestore();
    });

    it('shows edit form when edit button is clicked', async () => {
        const todo = createMockTodo({ title: 'Editable Todo' });
        const wrapper = mount(TodoItem, {
            props: { todo },
        });

        const editButton = wrapper.find('[title="Edit todo"]');
        await editButton.trigger('click');

        expect(wrapper.find('form').exists()).toBe(true);
    });

    it('calls toggleTodo when checkbox is clicked', async () => {
        const todo = createMockTodo({ id: 1, is_complete: false });
        const store = useTodoStore();
        const toggleSpy = vi.spyOn(store, 'toggleTodo');

        const wrapper = mount(TodoItem, {
            props: { todo },
        });

        const toggleButton = wrapper.find('button[class*="text-gray-400"]');
        await toggleButton.trigger('click');

        expect(toggleSpy).toHaveBeenCalledWith(todo);
    });

    it('calls deleteTodo when delete button is clicked', async () => {
        const todo = createMockTodo({ id: 1 });
        const store = useTodoStore();
        const deleteSpy = vi.spyOn(store, 'deleteTodo');

        const wrapper = mount(TodoItem, {
            props: { todo },
        });

        const deleteButton = wrapper.find('[title="Delete todo"]');
        await deleteButton.trigger('click');

        expect(deleteSpy).toHaveBeenCalledWith(todo.id);
    });

    it('shows loading spinner when toggling', () => {
        const todo = createMockTodo({ id: 1 });
        const store = useTodoStore();
        store.togglingTodoIds = new Set([1]);

        const wrapper = mount(TodoItem, {
            props: { todo },
        });

        expect(wrapper.find('.animate-spin').exists()).toBe(true);
    });

    it('shows loading spinner when deleting', () => {
        const todo = createMockTodo({ id: 1 });
        const store = useTodoStore();
        store.deletingTodoIds = new Set([1]);

        const wrapper = mount(TodoItem, {
            props: { todo },
        });

        const deleteButton = wrapper.find('[title*="Deleting"]');
        expect(deleteButton.exists()).toBe(true);
    });

    it('disables buttons when toggling or deleting', () => {
        const todo = createMockTodo({ id: 1 });
        const store = useTodoStore();
        store.togglingTodoIds = new Set([1]);

        const wrapper = mount(TodoItem, {
            props: { todo },
        });

        const buttons = wrapper.findAll('button[disabled]');
        expect(buttons.length).toBeGreaterThan(0);
    });
});

