<template>
    <div class="release-table">
        <el-table :data="releaseData"
                  style="width: 100%">
            <el-table-column prop="prop"
                             label="label"
                             width="width">
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts">
import { ref, onMounted } from "vue";
export default {
    name: "ReleaseTable",
    setup() {
        const releaseData = ref([]);

        const getData = () => {
            window
                .snsHttp({
                    url: "http://localhost:7280/getCdTime",
                    urlParams: {
                        env: "prod",
                    },
                    timeout: 120000,
                })
                .then((res: any) => {
                    console.log(res);
                });
        };

        onMounted(() => {
            getData();
        });

        return {
            releaseData,
        };
    },
};
</script>
