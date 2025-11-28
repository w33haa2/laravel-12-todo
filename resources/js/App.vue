<script setup lang="ts">
import { RouterView } from 'vue-router';
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';
import { LogOut, User } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
    if (authStore.token) {
        await authStore.fetchUser();
    }
});

const handleLogout = async () => {
    await authStore.logout();
    router.push('/login');
};
</script>

<template>
    <div class="min-h-screen bg-gray-100 text-gray-900">
        <header v-if="authStore.user" class="bg-white shadow">
            <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <h1 class="text-3xl font-bold text-gray-900">
                    Laravel Vue Todo
                </h1>
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <User class="h-4 w-4" />
                        <span>{{ authStore.user.name }}</span>
                    </div>
                    <button
                        @click="handleLogout"
                        class="inline-flex items-center gap-2 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        <LogOut class="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </div>
        </header>
        <main>
            <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <RouterView />
            </div>
        </main>
    </div>
</template>
