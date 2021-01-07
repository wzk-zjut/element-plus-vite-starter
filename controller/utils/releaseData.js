// 发布数据接口相关操作
const request = require("request")
const {
    formatParams,
    fetch
} = require('./utils')
const { getContainerCache, setContainerCache } = require('./cacheContainer')
// 整理CD数据
// 参数说明: env 环境（prod, test)
const getCDData = (env, isSns = 0) => {
    return new Promise(async (resolve, reject) => {
        let res = new Object()
        try {
            const nowData = await fetchCD({
                env
            }, isSns)
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
            if (env === 'test') {
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
        } catch (error) {
            reject(error)
        }
    })
}

const fetchCD = (params, isSns) => {
    if (isSns == 1) {
        return new Promise((resolve, reject) => {
            fetch("http://localhost:7280/getSnsCd", params).then((res) => {
                const {
                    errorCode,
                    errorMsg,
                    result
                } = res;
                if (errorCode == 0) {
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
                    if (JSON.parse(body).code == 1) {
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

// 整理CI数据
const getCITime = (env) => {
    const objList = [
        'ask_frontend',
        'tg-chat-frontend',
        'tougu-tab',
        'tg-mobile-live',
        'gsjl-web',
        'front-main-app',
        'sns-backstage'
    ]
    const envObj = {
        prod: 'master',
        staging: 'preview',
        test: 'testing'
    }
    return new Promise(async (resolve, reject) => {
        try{
            const nowData = await fetchCI({
                start: formatTime((new Date()).getTime() - 7 * 24 * 60 * 60 * 1000),
                end: formatTime((new Date()).getTime()),
                names: objList.join(','),
                branch: envObj[env]
            })
            const lastData = await fetchCI({
                start: formatTime((new Date()).getTime() - 14 * 24 * 60 * 60 * 1000),
                end: formatTime((new Date()).getTime() - 7 * 24 * 60 * 60 * 1000),
                names: objList.join(','),
                branch: envObj[env]
            })
            const nowAvearge = getCIAverage(nowData, envObj[env])
            const lastAvearge = getCIAverage(lastData, envObj[env])
            let res = {
                CI: {
                    time: nowAvearge,
                    differ: parseFloat((nowAvearge - lastAvearge).toFixed(1))
                }
            }
            resolve(res)
        }catch (error) {
            reject(error)
        }
    })
}

// 整理容器重启时间数据
const getContainerTime = () => {
    return new Promise(async (resolve, reject) => {
        const isCache = await getContainerCache()
        if(isCache !== 'noCache') {
            const res = {
                container: isCache
            }
            resolve(res)
            return
        }
        const objList = [
            'sns-tgtab-frontend',
            'sns-groupchat-frontend',
            'sns-live-frontend',
            'website-frontend-wd',
            'sns-gsjl-frontend',
            'website-cmp-frontmainapp-pod',
            'sns-backstage-frontend'
        ]
        let [nowTotalTime, nowTotal, lastTotalTime, lastTotal] = [0, 0, 0, 0]
        try{
            for(let i in objList) {
                const {time: objNowTotalTime, total: objNowTotal} = await fetchContainerTime({
                    name: objList[i],
                    start: parseInt(new Date().getTime() / 1000) - 7 * 24 * 60 * 60,
                    end: parseInt(new Date().getTime() / 1000)
                })
                nowTotalTime += objNowTotalTime
                nowTotal += objNowTotal
                const {time: objLastTotalTime, total: objLastTotal} = await fetchContainerTime({
                    name: objList[i],
                    start: parseInt(new Date().getTime() / 1000) - 14 * 24 * 60 * 60,
                    end: parseInt(new Date().getTime() / 1000) - 7 * 24 * 60 * 60,
                })
                lastTotalTime += objLastTotalTime
                lastTotal += objLastTotal
            }
            const nowAverage = parseFloat((nowTotalTime / nowTotal).toFixed(1))
            const lastAverage = parseFloat((lastTotalTime / lastTotal).toFixed(1))
            const res = {
                container: {
                    time: nowAverage,
                    differ: parseFloat(nowAverage - lastAverage)
                }
            }
            await setContainerCache({
                time: nowAverage,
                differ: parseFloat(nowAverage - lastAverage)
            })
            resolve(res)
        }catch(error) {
            reject(error)
        }
    })
}

const fetchCI = (params) => {
    return new Promise((resolve, reject) => {
        fetch("http://cloud.myhexin.com/pack/api/data/sns", params).then(res => {
            resolve(res.data)
        }).catch(error => {
            reject(error)
        }) 
    })
}

const fetchContainerTime = (params) => {
    return new Promise((resolve, reject) => {
        fetch("http://cloud.myhexin.com/mdev/api/v1/podEvent", params, true).then(res => {
            const {code, data} = res
            if(code == 0) {
                resolve({
                    time: data.total,
                    total: data.number
                })
            } else {
                resolve({
                    time: 0,
                    total: 0
                })
            }
        }).catch(error => {
            reject(error)
        })
    })
}

const formatTime = (time) => {
    const local = new Date(time).toLocaleDateString()
    const arr = local.split('-')
    const res = arr.map(item => {
        if (parseInt(item) < 10) {
            return `0${item}`
        } else {
            return item
        }
    })
    return res.join('-')
}

const getCIAverage = (data, env) => {
    let valueArr = Object.values(data)
    valueArr = valueArr.filter(item => {
        return item.ave_time[env]
    })
    if(!valueArr.length) {
        return 0
    }
    let totalTime = 0
    let total = 0
    valueArr.forEach(item => {
        totalTime += parseFloat(item.ave_time[env]) * parseFloat(item.count[env])
        total += parseInt(item.count[env])
    })
    return parseFloat((totalTime / total).toFixed(1))
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
        if (env === 'test') {
            res = {
                devTime: {
                    time: 42,
                    differ: 0
                },
            }
        } else {
            res = {
                devTime: {
                    time: 54,
                    differ: 0
                },
            }
        }
        resolve(res)
    })
}

module.exports = {
    getCDData,
    mock,
    getCITime,
    formatTime,
    getContainerTime
}