import { createWebHistory, createRouter } from 'vue-router';

import { getCookie } from '@/utils/utility.js';

import Home from '@/views/Home.vue';
import About from '@/views/About.vue';
import App from '@/views/App.vue';
import Error from '@/views/Error.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: {
            // makes the page only available to not authenticated users
            guest: true,
        }
    },
    {
        path: '/about',
        name: 'About',
        component: About,
    },
    {
        path: '/app',
        name: 'App',
        component: App,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/404',
        name: '404',
        component: Error,
    },
    { path: '*', redirect: '/404' }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (!getCookie('SPOTIFY_ACCESS_TOKEN') && !getCookie('SPOTIFY_REFRESH_TOKEN')) {
            next({ path: '/' });
        } else {
            next();
        }
    } else if (to.matched.some((record) => record.meta.guest)) {
        if (!getCookie('SPOTIFY_ACCESS_TOKEN') && !getCookie('SPOTIFY_REFRESH_TOKEN')) {
            next();
        } else {
            next({ path: '/app' });
        }
    } else {
        next();
    }
});

export default router;