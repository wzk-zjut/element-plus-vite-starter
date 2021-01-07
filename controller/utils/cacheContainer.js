const fs = require('fs')
const cacheStr = require('../cache/containerCache')

let cacheObj = {}
if (cacheStr) {
    cacheObj = JSON.parse(cacheStr)
}

const getContainerCache = () => {
    return new Promise((resolve, reject) => {
        const nowTime = (new Date()).getDate();
        if(nowTime === (new Date(cacheObj.time)).getDate()) {
            const res = cacheObj.cache
            if(res.time) {
                resolve(res)
            } else {
                resolve('noCache')
            }
        } else {
            resolve('noCache')
        }
    })
}

const setContainerCache = (data) => {
    return new Promise((resolve, reject) => {
        const nowTime = (new Date()).getTime();
        const res = {time: nowTime, cache: data}
        const str = `module.exports = '${JSON.stringify(res)}'`
        fs.writeFileSync('./cache/containerCache.js', str)
        resolve()
    })
}

module.exports = {
    getContainerCache,
    setContainerCache
}