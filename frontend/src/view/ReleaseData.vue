<template>
    <div class="release-data">
        <el-row :gutter="10">
            <el-col :span="6">
                <el-radio-group v-model="envValue" @change="chooseEnv">
                    <el-radio-button label="测试"></el-radio-button>
                    <el-radio-button label="正式"></el-radio-button>
                </el-radio-group>
            </el-col>
            <el-col :span="6" class="switch">
                <el-switch 
                v-model="isSns" 
                :loading="isLoading"
                @change="chooseSns"
                active-text="sns项目" 
                inactive-text="全部项目" 
                active-color="#13ce66"
                inactive-color="#ff4949"></el-switch>
            </el-col>
        </el-row>
        <header class="time-card-title">本周发布时间数据概览</header>
        <div class="time-card-container" v-if="releaseData" v-loading="isLoading">
            <el-card class="card">
                <template #header>
                    <div class="title">内网手工时间</div>
                </template>
                <div class="content">
                    {{releaseData.devTime.time}}秒
                </div>
                <div class="content differ" :class="getDifferClass(releaseData.devTime.differ)">
                    较上周{{getDiffer(releaseData.devTime.differ)}}
                </div>
            </el-card>
            <el-card class="card">
                <template #header>
                    <div class="title">CI时间</div>
                </template>
                <div class="content">
                    {{releaseData.CI.time}}秒
                </div>
                <div class="content differ" :class="getDifferClass(releaseData.CI.differ)">
                    较上周{{getDiffer(releaseData.CI.differ)}}
                </div>
            </el-card>
            <el-card class="card">
                <template #header>
                    <div class="title">CD容器发布时间</div>
                </template>
                <div class="content">
                    {{releaseData.CD.containerPh.time}}秒
                </div>
                <div class="content differ" :class="getDifferClass(releaseData.CD.containerPh.differ)">
                    较上周{{getDiffer(releaseData.CD.containerPh.differ)}}
                </div>
            </el-card>
            <el-card class="card" v-if="envValue=='正式' && releaseData.CD.resourcePh">
                <template #header>
                    <div class="title">CD静态资源上传时间</div>
                </template>
                <div class="content">
                    {{releaseData.CD.resourcePh.time}}秒
                </div>
                <div class="content differ" :class="getDifferClass(releaseData.CD.resourcePh.differ)">
                    较上周{{getDiffer(releaseData.CD.resourcePh.differ)}}
                </div>
            </el-card>
            <el-card class="card">
                <template #header>
                    <div class="title">容器重启</div>
                </template>
                <div class="content">
                    {{releaseData.container.time}}秒
                </div>
                <div class="content differ" :class="getDifferClass(releaseData.container.differ)">
                    较上周{{getDiffer(releaseData.container.differ)}}
                </div>
            </el-card>
            <el-card class="card">
                <template #header>
                    <div class="title">总时间</div>
                </template>
                <div class="content">
                    {{totalTime.toFixed(1)}}秒
                </div>
                <div class="content differ" :class="getDifferClass(totalDiffer)">
                    较上周{{getDiffer(totalDiffer)}}
                </div>
            </el-card>
        </div>
    </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
export default {
    setup() {
        const envValue = ref("测试")
        const releaseData = ref<release.releaseData | null>(null)
        const totalTime = ref(0)
        const totalDiffer = ref(0)
        const isSns = ref(true)
        const isLoading = ref(true)

        const envObj: any = {
            "正式": "prod",
            "测试": "test",
        };

        const getData = (params: any) => { 
            isLoading.value = true
            window.snsHttp({
                url: "http://localhost:7280/releaseData",
                urlParams: params
            }).then((res: any) => {
                const { errorCode, errorMsg, result } = res;
                if(errorCode === 0) {
                    isLoading.value = false
                    releaseData.value = result
                    getTotalTime(result)
                } else {
                    ElMessage.warning(errorMsg)
                }
            })
        }

        const chooseEnv = (value: string) => {
            getData({env: envObj[value], isSns: isSns.value ? 1 : 0})
        }

        const chooseSns = (value: boolean) => {
            getData({env: envObj[envValue.value], isSns: value ? 1 : 0})
        }

        const getDiffer = (differ: number) => {
            if(differ === 0) {
                return '没有变化'
            } else if(differ > 0) {
                return `慢了${differ.toFixed(1)}秒`
            } else {
                return `快了${Math.abs(differ).toFixed(1)}秒`
            }
        }

        const getDifferClass = (differ: number) => {
            if(differ > 0) {
                return 'red-differ'
            } else if (differ < 0) {
                return 'green-differ'
            } else {
                return ''
            }
        }

        const getTotalTime = (data: release.releaseData) => {
            totalTime.value = data.devTime.time + data.CI.time + data.container.time + data.CD.containerPh.time;
            totalDiffer.value = data.devTime.differ + data.CI.differ + data.container.differ + data.CD.containerPh.differ
            if(data.CD.resourcePh) {
                totalTime.value += data.CD.resourcePh.time
                totalDiffer.value += data.CD.resourcePh.differ
            }

        }

        onMounted(() => {
            getData({env: 'test', isSns: isSns.value ? 1 : 0})
        })

        return {
            envValue,
            chooseEnv,
            releaseData,
            getDiffer,
            getDifferClass,
            totalTime,
            totalDiffer,
            chooseSns,
            isSns,
            isLoading
        };
    },
};
</script>

<style scoped lang="less">
.release-data {
    height: 100%;
    .switch {
        display: flex !important;
        align-items: center;
    }
    .time-card-title {
        font-size: 24px;
        margin-top: 20px;
        font-weight: bold;
    }
    .time-card-container{
        display: flex;
        justify-content: space-around;
        width: 100%;
        margin-top: 10px;
        .card{
            width: 200px;
        }
        .title{
            text-align: center;
            font-weight: bold;
        }
        .content{
            text-align: center;
        }
        .differ{
            margin-top: 10px;
        }
        .red-differ {
            color: #e93030;
        }
        .green-differ {
            color: #009900;
        }
    }
}
</style>