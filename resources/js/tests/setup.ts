import { vi } from 'vitest';
import { config } from '@vue/test-utils';
// import { webcrypto } from 'crypto';

// // Polyfill for crypto in Node < 18
// if (typeof globalThis.crypto === 'undefined') {
//     globalThis.crypto = webcrypto as any;
// }

// Mock axios
vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

// Mock Inertia
vi.mock('@inertiajs/vue3', () => ({
    usePage: () => ({
        component: 'Home',
        props: {},
        url: '/',
        version: null,
    }),
    router: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
    Link: {
        name: 'Link',
        template: '<a><slot /></a>',
    },
}));

// Global test configuration
config.global.stubs = {
    Transition: {
        template: '<div><slot /></div>',
    },
    'transition-group': {
        template: '<div><slot /></div>',
    },
};

