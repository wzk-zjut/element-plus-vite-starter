const cachestr = require('../cache/cache')
const {
    formatParams
} = require('./utils')
const fs = require('fs')

let cacheObj = {}
if (cachestr) {
    cacheObj = JSON.parse(cachestr)
}


// 读取缓存逻辑
const getCache = (params) => {
    const paramsStr = formatParams(params)
    return new Promise((resolve, reject) => {
        const nowTime = (new Date()).getDate();
        if (nowTime === (new Date(cacheObj.time)).getDate()) {
            const res = cacheObj.cache.filter(item => {
                return item.params == paramsStr
            })
            // 有缓存
            if (res.length !== 0) {
                resolve(res[0].data)
            } else {
                resolve('noCache')
            }
        } else {
            resolve('noCache')
        }
    })
}

// 缓存逻辑
const cacheCD = (data, params) => {
    const paramsStr = formatParams(params)
    return new Promise((resolve, reject) => {
        const nowTime = (new Date()).getTime();
        if ((new Date(cacheObj.time)).getDate() === (new Date(nowTime)).getDate()) {
            const res = cacheObj.cache.some(item => {
                return item.params == paramsStr
            })
            if (res) {
                cacheObj.cache = cacheObj.cache.map(item => {
                    if (item.params == paramsStr) {
                        item.data = data     
                    }
                    return item
                })
            } else {
                cacheObj.cache.push({
                    params: paramsStr,
                    data
                })
            }
            const str = `module.exports = '${JSON.stringify(cacheObj)}'`
            fs.writeFileSync('./cache/cache.js', str)
            resolve()
        } else {
            // 缓存过期了
            const obj = {
                time: nowTime,
                cache: [{
                    params: paramsStr,
                    data,
                }]
            }
            const str = `module.exports = '${JSON.stringify(obj)}'`
            fs.writeFileSync('./cache/cache.js', str)
            resolve()
        }
    })
}

module.exports = {
    getCache,
    cacheCD,
    formatParams
}