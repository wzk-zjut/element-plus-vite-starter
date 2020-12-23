import { createRouter, createWebHistory } from 'vue-router'
import CDTable from '../view/CDTable.vue'
import ReleaseData from '../view/ReleaseData.vue'

export default createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: ReleaseData,
        },
        {
            path: '/CDTable',
            component: CDTable,
        }
    ]
})