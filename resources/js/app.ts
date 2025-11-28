import '../css/app.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import { initializeTheme } from './composables/useAppearance';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');

initializeTheme();
