import { createRouter, createWebHistory } from 'vue-router'
import CDTable from '../view/CDTable.vue'
import RelaseTable from '../view/ReleaseTable.vue'

export default createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: RelaseTable
        },
        {
            path: '/CDTable',
            component: CDTable
        }
    ]
})