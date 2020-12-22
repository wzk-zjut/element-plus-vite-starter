// 发布数据接口相关操作
const request = require("request")
const { formatParams } = require('./cacheCD')
// 整理CD数据
// 参数说明: env 环境（prod, test)
const getCDData = (env) => {
    return new Promise(async (resolve, reject) => {
        let res = new Object()
        try{
            const nowData = await fetchCD({env})
            const lastWeek = await fetchCD({
                etime: formatTime((new Date()).getTime() - 7 * 24 * 60 * 60 * 1000),
                stime: formatTime((new Date()).getTime() - 14 * 24 * 60 * 60 * 1000),
                env
            })
            const nowContainerData = nowData[env].filter(item => {
                return item.program_name.indexOf('thsi_resource') == -1
            })
            const lastContainerData = lastWeek[env].filter(item => {
                return item.program_name.indexOf('thsi_resource') == -1
            })
            const nowResourceData = nowData[env].filter(item => {
                return item.program_name.indexOf('thsi_resource') !== -1
            })
            const lastResourceData = lastWeek[env].filter(item => {
                return item.program_name.indexOf('thsi_resource') !== -1
            })
            const nowContainerAverage = getCDAverage(nowContainerData)
            const lastContainerAverage = getCDAverage(lastContainerData)
            const nowResourceAverage = getCDAverage(nowResourceData)
            const lastResourceAverage = getCDAverage(lastResourceData)
            if(env === 'test') {
                res = {
                    containerPh: {
                        weekTime: nowContainerAverage,
                        differ: nowContainerAverage - lastContainerAverage
                    }
                }
            } else {
                res = {
                    containerPh: {
                        weekTime: nowContainerAverage,
                        differ: parseFloat((nowContainerAverage - lastContainerAverage).toFixed(1))
                    },
                    resourcePh: {
                        weekTime: nowResourceAverage,
                        differ: parseFloat((nowResourceAverage - lastResourceAverage).toFixed(1))
                    }
                }
            }
            resolve(res)
        } catch(error) {
            reject(error)
        }
    })
}

const fetchCD = (params) => {
    return new Promise((resolve, reject) => {
        const baseUrl = "http://localhost:7280/getCdTime?"
        request(baseUrl + formatParams(params), (error, response, body) => {
            if (error) {
                reject(error)
            } else if (response.statusCode == 200) {
                if(JSON.parse(body).code == 1) {
                    resolve(JSON.parse(body).data)
                } else {
                    reject(JSON.parse(body).msg)
                }
            } else {
                reject()
            }
        })
    })
}

const formatTime = (time) => {
    const local = new Date(time).toLocaleDateString()
    const arr = local.split('-')
    const res = arr.map(item => {
        if(parseInt(item) < 10) {
            return `0${item}`
        } else {
            return item
        }
    })
    return res.join('-')
}

const getCDAverage = (data) => {
    let totalTime = 0;
    let total = 0
    data.map(item => {
        totalTime += (item.average_release_time * item.total);
        total += item.total
    })
    return parseFloat((totalTime / total).toFixed(1))
}

module.exports = {
    getCDData
}