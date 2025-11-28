import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TodoList from '../TodoList.vue';
import { useTodoStore } from '../../stores/todo';
import { createMockTodo } from '../../tests/utils';

describe('TodoList', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('renders loading state when loading', () => {
        const store = useTodoStore();
        store.loading = true;
        store.todos = [];

        const wrapper = mount(TodoList);

        expect(wrapper.text()).toContain('Loading todos...');
        expect(wrapper.find('.animate-spin').exists()).toBe(true);
    });

    it('renders empty state when no todos', () => {
        const store = useTodoStore();
        store.loading = false;
        store.todos = [];

        const wrapper = mount(TodoList);

        expect(wrapper.text()).toContain('No todos found. Add one above!');
    });

    it('renders list of todos when todos exist', () => {
        const store = useTodoStore();
        store.loading = false;
        store.todos = [
            createMockTodo({ id: 1, title: 'Todo 1' }),
            createMockTodo({ id: 2, title: 'Todo 2' }),
        ];

        const wrapper = mount(TodoList);

        const todoItems = wrapper.findAll('li');
        expect(todoItems.length).toBe(2);
    });

    it('renders TodoItem components for each todo', () => {
        const store = useTodoStore();
        store.loading = false;
        store.todos = [
            createMockTodo({ id: 1, title: 'First Todo' }),
            createMockTodo({ id: 2, title: 'Second Todo' }),
        ];

        const wrapper = mount(TodoList);

        expect(wrapper.html()).toContain('First Todo');
        expect(wrapper.html()).toContain('Second Todo');
    });
});

