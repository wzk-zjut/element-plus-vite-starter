<template>
    <div class="release-table">
        <header>CD发布数据</header>
        <el-row :gutter="10" class="status-bar">
            <el-col :span="3">
                <el-select v-model="seachValue"
                           placeholder="选择程序名"
                           filterable
                           clearable
                           @change="searchData"
                           v-if="searchOption.length">
                    <el-option v-for="(item, index) in searchOption"
                               :key="index"
                               :label="item"
                               :value="item">
                    </el-option>
                </el-select>
            </el-col>
            <el-col :span="6">
                <el-radio-group v-model="envValue"
                                @change="chooseEnv">
                    <el-radio-button label="正式"></el-radio-button>
                    <el-radio-button label="预发布"></el-radio-button>
                    <el-radio-button label="测试"></el-radio-button>
                </el-radio-group>
            </el-col>
        </el-row>
        <el-table :data="releaseData"
                  style="width: 100%"
                  border
                  v-loading="isLoading"
                  height="830">
            <el-table-column prop="program_name"
                             label="程序名"
                             align="center">
            </el-table-column>
            <el-table-column prop="program_type"
                             label="程序类型"
                             align="center">
            </el-table-column>
            <el-table-column prop="second_business"
                             label="二级业务节点"
                             align="center">
            </el-table-column>
            <el-table-column prop="third_business"
                             label="三级业务节点"
                             align="center">
            </el-table-column>
            <el-table-column prop="total"
                             label="总发布次数"
                             align="center">
            </el-table-column>
            <el-table-column prop="failure"
                             label="失败次数"
                             align="center">
            </el-table-column>
            <el-table-column prop="average_release_time"
                             label="发布平均时间"
                             align="center">
            </el-table-column>
            <el-table-column prop="max_release_time"
                             label="发布最大时间"
                             align="center">
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
export default {
    name: "ReleaseTable",
    setup() {
        const releaseData = ref<release.CDData[]>([]);
        const seachValue = ref<string>("");
        const searchOption = ref<string[]>([]);
        const envValue = ref<string>("正式");
        let isLoading = ref<boolean>(true);

        const getData = (params: any, flag = false) => {
            isLoading.value = true;
            window
                .snsHttp({
                    url: "http://localhost:7280/getCdTime",
                    urlParams: params,
                    timeout: 120000,
                })
                .then((res: any) => {
                    if (res.code == 1) {
                        formatData(res.data[params.env]);
                        isLoading.value = false;
                        if (flag) {
                            releaseData.value.map((item) => {
                                if (item.program_name.indexOf("thsi_resource") == -1) {
                                    searchOption.value.push(item.program_name);
                                }
                            });
                        }
                    } else {
                        ElMessage.warning(res.msg);
                    }
                });
        };

        const formatData = (data: release.CDData[]) => {
            let repeatObj: Record<string, any> = {};
            for (let i = 0; i < data.length; i++) {
                if (!repeatObj[data[i].program_name]) {
                    repeatObj[data[i].program_name] = {
                        total: 0,
                        failure: 0,
                        max_release_time: 0,
                        average_release_time: 0,
                    };
                }
                for (let j = i + 1; j < data.length; j++) {
                    if (data[i].program_name == data[j].program_name) {
                        const programObj = repeatObj[data[i].program_name];
                        programObj.average_release_time = ((programObj.average_release_time * programObj.total + data[j].average_release_time * data[j].total) /
                            (programObj.total + data[j].total)
                        ).toFixed(1);
                        programObj.total += data[j].total;
                        programObj.failure += data[j].failure;
                        programObj.max_release_time = programObj.max_release_time > data[j].max_release_time ? programObj.max_release_time : data[j].max_release_time;
                        data.splice(j, 1);
                        j--;
                    }
                }
            }
            data.map((item: release.CDData) => {
                const repeat = repeatObj[item.program_name];
                item.average_release_time = parseFloat(
                    ((item.average_release_time * item.total + parseFloat(repeat.average_release_time) * repeat.total) / (item.total + repeat.total)).toFixed(1)
                );
                item.total += repeat.total;
                item.failure += repeat.failure;
                item.max_release_time = item.max_release_time > repeat.max_release_time ? item.max_release_time : repeat.max_release_time;
            });
            releaseData.value = data;
        };

        const searchData = (value: string) => {
            const envObj: any = {
                正式: "prod",
                预发布: "staging",
                测试: "test",
            };
            getData({ env: envObj[envValue.value], program: value });
        };

        const chooseEnv = (value: string) => {
            const envObj: any = {
                正式: "prod",
                预发布: "staging",
                测试: "test",
            };
            getData({ env: envObj[value], program: seachValue.value });
        };

        onMounted(() => {
            getData({ 
                env: "prod",
                program: "" ,
                }, true);
        });

        return {
            releaseData,
            seachValue,
            searchData,
            isLoading,
            searchOption,
            envValue,
            chooseEnv,
        };
    },
};
</script>

<style lang="less" scoped>
.release-table {
    header {
        text-align: left;
        font-weight: bold;
        font-size: 24px;
    }
}
/deep/ .el-table__body-wrapper {
    overflow-y: auto !important;
}
/deep/ .has-gutter {
    th {
        background-color: #409eff;
        color: #fff;
    }
}
.status-bar {
    margin: 10px 0;
}
</style>
