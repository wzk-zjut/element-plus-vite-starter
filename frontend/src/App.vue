<template>
    <el-container>
        <el-aside>
            <Menu />
        </el-aside>
        <el-main>
            <router-view v-slot="{ Component }">
                <keep-alive>
                    <component :is="Component" />
                </keep-alive>
            </router-view>
        </el-main>
    </el-container>
</template>

<script>
import Menu from './components/Menu.vue'
import { computed } from 'vue'
import { useRoute } from "vue-router";

export default {
    name: 'App',
    components: {
        Menu
    }
}
</script>

<style scoped lang="less">
</style>
