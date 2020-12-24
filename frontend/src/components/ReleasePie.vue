<template>
    <div class="release-pie">
        <header>发布时间消耗占比</header>
        <div class="pie" id="chart"></div>
    </div>
</template>

<script lang="ts">
import { watch, ref, onMounted } from 'vue'
export default{
    props: {
        data: {type: Object as () => release.releaseData, default: null},
        envValue: {type: String, default: "测试"}
    },
    setup (props) {
        const initPie = () => {
            const data: release.releaseData = props.data
            if(!data) {
                return
            }
            const myChart = window.echarts.init(document.getElementById('chart'))
            const option = {
                series: [
                    {
                        name: `本周${props.envValue}环境发布时间占比`,
                        type: 'pie',
                        radius: '55%',
                        data: [
                            {value: data.devTime.time, name: "内网手工时间"},
                            {value: data.CI.time, name: "CI时间"},
                            {value: data.CD.containerPh.time, name: "CD容器发布时间"},
                            {value: data.container.time, name: "容器重启时间"}
                        ]
                    }
                ]
            }
            if(data.CD.resourcePh) {
                option.series[0].data.push({value: data.CD.resourcePh.time, name: "CD资源上传时间"})
            }
            myChart.setOption(option)
        }

        onMounted(() => {
            initPie()
        })

        watch(
            () => props.data,
            () => {
                initPie()
            },
        )
        return {}
    }
}
</script>

<style scoped lang="less">
.release-pie{
    header {
        font-size: 24px;
        margin-top: 20px;
        font-weight: bold;
    }
    .pie{
        width: 450px;
        height: 450px;
        margin: 0 auto;
    }
}
</style>