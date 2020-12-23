// 发布数据接口相关操作
const request = require("request")
const { formatParams, fetch } = require('./utils')
// 整理CD数据
// 参数说明: env 环境（prod, test)
const getCDData = (env, isSns = 0) => {
    return new Promise(async (resolve, reject) => {
        let res = new Object()
        try{
            const nowData = await fetchCD({env}, isSns)
            const lastWeek = await fetchCD({
                etime: formatTime((new Date()).getTime() - 7 * 24 * 60 * 60 * 1000),
                stime: formatTime((new Date()).getTime() - 14 * 24 * 60 * 60 * 1000),
                env
            }, isSns)
            const nowContainerData = nowData.filter(item => {
                return item.program_name.indexOf('thsi_resource') == -1
            })
            const lastContainerData = lastWeek.filter(item => {
                return item.program_name.indexOf('thsi_resource') == -1
            })
            const nowResourceData = nowData.filter(item => {
                return item.program_name.indexOf('thsi_resource') !== -1
            })
            const lastResourceData = lastWeek.filter(item => {
                return item.program_name.indexOf('thsi_resource') !== -1
            })
            const nowContainerAverage = getCDAverage(nowContainerData)
            const lastContainerAverage = getCDAverage(lastContainerData)
            const nowResourceAverage = getCDAverage(nowResourceData)
            const lastResourceAverage = getCDAverage(lastResourceData)
            if(env === 'test') {
                res = {
                    containerPh: {
                        time: nowContainerAverage,
                        differ: parseFloat((nowContainerAverage - lastContainerAverage).toFixed(1))
                    }
                }
            } else {
                res = {
                    containerPh: {
                        time: nowContainerAverage,
                        differ: parseFloat((nowContainerAverage - lastContainerAverage).toFixed(1))
                    },
                    resourcePh: {
                        time: nowResourceAverage,
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

const fetchCD = (params, isSns) => {
    if(isSns == 1) {
        return new Promise((resolve, reject) => {
            fetch("http://localhost:7280/getSnsCd", params).then((res) => {
                const {errorCode, errorMsg, result} = res;
                if(errorCode == 0) {
                    resolve(result)
                } else {
                    reject(errorMsg)
                }
            }).catch((error) => {
                reject(error)
            }) 
        })
    } else {
        return new Promise((resolve, reject) => {
            const baseUrl = "http://localhost:7280/getCdTime?"
            request(baseUrl + formatParams(params), (error, response, body) => {
                if (error) {
                    reject(error)
                } else if (response.statusCode == 200) {
                    if(JSON.parse(body).code == 1) {
                        resolve(JSON.parse(body).data[params.env])
                    } else {
                        reject(JSON.parse(body).msg)
                    }
                } else {
                    reject()
                }
            })
        })
    }
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

// 接口还没提供完全前自己mock数据
const mock = (env) => {
    let res = new Object()
    return new Promise((resolve, reject) => {
        if(env === 'test') {
            res = {
                devTime: {
                    time: 42,
                    differ: 0
                },
                CI: {
                    time: 43.9,
                    differ: -32.5
                },
                container: {
                    time: 54,
                    differ: 0
                }
            }
        } else {
            res = {
                devTime: {
                    time: 54,
                    differ: 0
                },
                CI: {
                    time: 63.7,
                    differ: -45.8
                },
                container: {
                    time: 54,
                    differ: 0
                }
            }
        }
        resolve(res)
    })
}

module.exports = {
    getCDData,
    mock
}