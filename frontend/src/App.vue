<template>
    <el-container>
        <el-aside>
            <Menu />
        </el-aside>
        <el-main>
            <router-view></router-view>
        </el-main>
    </el-container>
</template>

<script>
import Menu from './components/Menu.vue'
export default {
    name: 'App',
    components: {
        Menu
    }
}
</script>

<style scoped lang="less">
</style>
