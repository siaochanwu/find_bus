import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'main',
            component: () => import('../components/Main.vue'),
        },
        {
            path: '/route/:routeName',
            name: 'route',
            component: () => import('../components/Route.vue')
        }
    ]
})

export default router