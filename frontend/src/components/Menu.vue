<template>
    <div class="menu">
        <el-menu :default-active="CDrouter"
                 background-color="#545c64"
                 text-color="#fff"
                 active-text-color="#ffd04b"
                 class="menu-container"
                 router>
            <el-menu-item index="/">发布数据</el-menu-item>
            <el-menu-item index="/CDTable">CD发布数据</el-menu-item>
        </el-menu>
    </div>
</template>

<script lang="ts">
import { watch, ref, computed } from "vue";
import { useRoute } from "vue-router";
export default {
    setup() {
        const route = useRoute();
        const CDrouter = computed(() => route.path);
        return {
            CDrouter,
        };
    },
};
</script>

<style scoped lang="less">
.menu {
    height: 100%;
    &-container {
        height: 100%;
    }
}
</style>