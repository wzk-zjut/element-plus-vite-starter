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

const fetch = (url, params) => {
    if(url.indexOf('?') === -1) {
        url = url + '?'
    }
    return new Promise((resolve, reject) => {
        request(url + formatParams(params), (error, response, body) => {
            if(error) {
                reject(error)
            } else if (response.statusCode == 200) {
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