const request = require('request')

// 处理params
const formatParams = (params) => {
    let arr = []
    Object.keys(params).map(val => {
        arr.push(`${val}=${params[val]}`)
    })
    const paramsStr = arr.join('&')
    return paramsStr
}

const fetch = (url, params, isContainer = false) => {
    if(url.indexOf('?') === -1) {
        url = url + '?'
    }
    return new Promise((resolve, reject) => {
        request(url + formatParams(params), (error, response, body) => {
            console.log(url + formatParams(params))
            if(error) {
                reject(error)
            } else if (response.statusCode == 200 || isContainer) {
                resolve(JSON.parse(body))
            } else {
                reject()
            }
        })
    })
}

module.exports = {
    formatParams,
    fetch
}