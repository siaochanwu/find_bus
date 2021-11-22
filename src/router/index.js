import { createRouter, createWebHashHistory } from "vue-router";

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: '',
            component: () => import('../components/Main.vue')
        }
    ]
})

export default router