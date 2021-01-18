import { createWebHistory, createRouter } from 'vue-router';

import { getCookie } from '@/utils/index.js';

const Home = () => import(/* webpackChunkName: "home" */ '@/views/Home.vue');
const Main = () => import(/* webpackChunkName: "group-authenticated" */ '@/views/Main.vue');
const About = () => import(/* webpackChunkName: "about" */ '@/views/About.vue');
const Logout = () => import(/* webpackChunkName: "group-else" */ '@/views/Logout.vue');
const Imprint = () => import(/* webpackChunkName: "group-else" */ '@/views/Imprint.vue');
const DataPrivacy = () => import(/* webpackChunkName: "group-else" */ '@/views/DataPrivacy.vue');
const NotFound = () => import(/* webpackChunkName: "group-else" */ '@/views/NotFound.vue');

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home,
        meta: {
            // makes the page only available to not authenticated users
            guest: true,
        },
        props: true,
    },
    {
        path: '/player',
        name: 'main',
        component: Main,
        meta: {
            requiresAuth: true
        },
        props: true,
    },
    {
        path: '/about',
        name: 'about',
        component: About,
        props: true,
    },
    {
        path: '/logout',
        name: 'logout',
        component: Logout,
        meta: {
            requiresAuth: true
        },
        props: true,
    },
    {
        path: '/imprint',
        name: 'imprint',
        component: Imprint,
        props: true,
    },
    {
        path: '/data-privacy',
        name: 'data-privacy',
        component: DataPrivacy,
        props: true,
    },
    {
        path: '/404',
        name: '404',
        component: NotFound,
        props: true,
    },
    { path: '/:catchAll(.*)', redirect: '/404' }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    /**
     * Handle authentication
     */
    const isAuthenticated = getCookie('SPOTIFY_ACCESS_TOKEN') && getCookie('SPOTIFY_REFRESH_TOKEN')
        ? true
        : false;

    to.params.isAuthenticated = isAuthenticated;

    if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (!isAuthenticated) {
            next({ path: '/', params: { isAuthenticated } });
        } else {
            next();
        }
    } else if (to.matched.some((record) => record.meta.guest)) {
        if (!isAuthenticated) {
            next();
        } else {
            next({ path: '/player', params: { isAuthenticated } });
        }
    } else {
        next();
    }
});

export default router;