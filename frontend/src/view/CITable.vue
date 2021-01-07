<template>
    <div class="CI-table">
        <header>CI发布数据</header>
        <div class="choose">
            <el-radio-group v-model="branch" @change="chooseBranch">
                <el-radio-button label="master"></el-radio-button>
                <el-radio-button label="testing"></el-radio-button>
            </el-radio-group>
        </div>
        <el-table
            :data="CIData"
            style="width: 100%"
            border
            v-loading="isLoading">
            <el-table-column
                prop="name"
                label="项目名"
                align="center">
            </el-table-column>
            <el-table-column
                prop="ave_time"
                label="构建平均时间"
                align="center">
            </el-table-column>
            <el-table-column
                prop="max_time"
                label="构建最大时间"
                align="center">
            </el-table-column>
            <el-table-column
                prop="failed"
                label="失败次数"
                align="center">
            </el-table-column>
            <el-table-column
                prop="count"
                label="构建次数"
                align="center">
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from "element-plus";
export default {
    name: "CITable",
    setup() {
        const branch = ref<"master" | "testing">("master")
        const CIData = ref<release.CIData[]>([])
        const isLoading = ref(true)

        const getData = (branch: "master" | "testing" = "master") => {
            isLoading.value = true
            window.snsHttp({
                url: "http://localhost:7280/getCIData",
                urlParams: {
                    branch
                }
            }).then((res: any) => {
                isLoading.value = false
                const { errorCode, errorMsg, result } = res
                if(errorCode == 0) {
                    CIData.value = result
                } else {
                    ElMessage.warning(errorMsg);
                }
            })
        }

        const chooseBranch = (value: "master" | "testing") => {
            getData(value)
        }

        onMounted(() => {
            getData()
        })

        return {
            branch,
            CIData,
            isLoading,
            chooseBranch
        }
    }
}
</script>

<style lang="less" scoped>
.CI-table {
    header {
        text-align: left;
        font-weight: bold;
        font-size: 24px;
        margin-bottom: 10px;
    }
    .choose {
        margin-bottom: 10px;
    }
    /deep/ .has-gutter {
    th {
        background-color: #409eff;
        color: #fff;
    }
}
}
</style>