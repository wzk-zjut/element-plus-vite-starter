const request = require('request')

const fetchCD = (params) => {
    return new Promise((resolve, reject) => {
        let url = "http://172.20.216.183/pucr/index.php?m=api&c=api&a=index&op=static_resource_statistic&app_key=100000013&sign_method=md5&v=1.0&"
        let arr = []
        Object.keys(params).map(val => {
            arr.push(`${val}=${params[val]}`)
        })
        const str = arr.join('&')
        request(url + str, (error, response, body) => {
            if (error) {
                reject(error)
            } else if (response.statusCode == 200) {
                resolve(body)
            } else {
                reject()
            }
        })
    })
}

module.exports = fetchCD