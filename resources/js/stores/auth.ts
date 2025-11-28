import axios from 'axios';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface User {
    id: number;
    name: string;
    email: string;
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const token = ref<string | null>(localStorage.getItem('token'));
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Set axios default header if token exists
    if (token.value) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    }

    const register = async (name: string, email: string, password: string, password_confirmation: string) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.post('/api/register', {
                name,
                email,
                password,
                password_confirmation,
            });
            user.value = response.data.user;
            token.value = response.data.token;
            localStorage.setItem('token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        } catch (e: any) {
            error.value = e.response?.data?.message || 'Registration failed';
            throw e;
        } finally {
            loading.value = false;
        }
    };

    const login = async (email: string, password: string) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.post('/api/login', { email, password });
            user.value = response.data.user;
            token.value = response.data.token;
            localStorage.setItem('token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        } catch (e: any) {
            error.value = e.response?.data?.message || 'Login failed';
            throw e;
        } finally {
            loading.value = false;
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/logout');
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            user.value = null;
            token.value = null;
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    const fetchUser = async () => {
        if (!token.value) return;

        try {
            const response = await axios.get('/api/me');
            user.value = response.data;
        } catch (e) {
            // Token is invalid, clear it
            logout();
        }
    };

    return {
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        fetchUser,
    };
});
