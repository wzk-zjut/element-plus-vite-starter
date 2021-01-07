const request = require('request')
const {
    fetch
} = require('./utils')

const fetchCD = (params) => {
    return new Promise((resolve, reject) => {
        let url = "http://172.20.216.183/pucr/index.php?m=api&c=api&a=index&op=static_resource_statistic&app_key=100000013&sign_method=md5&v=1.0&"
        let arr = []
        Object.keys(params).map(val => {
            arr.push(`${val}=${params[val]}`)
        })
        const str = arr.join('&')
        console.log(url + str)
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

const fetchSnsCd = (arr, params) => {
    return new Promise((resolve) => {
        let resArr = []
        arr.map(async (item, index) => {
            let options = {
                ...params,
                ...{
                    program: item
                }
            }
            await fetch('http://localhost:7280/getCdTime', options).then((res) => {
                if (res.code == 1 && res.data[params.env]) {
                    resArr = resArr.concat(res.data[params.env])
                }
            })
            if (index == arr.length - 1) {
                resolve(resArr)
            }
        })
    })
}

module.exports = {
    fetchCD,
    fetchSnsCd
}