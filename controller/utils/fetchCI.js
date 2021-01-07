const { fetch } = require('./utils')
const { formatTime } = require('./releaseData')

const fetchCI = (branch) => {
    const objList = [
        'ask_frontend',
        'tg-chat-frontend',
        'tougu-tab',
        'tg-mobile-live',
        'gsjl-web',
        'front-main-app',
        'sns-backstage'
    ]
    return new Promise((resolve, reject) => {
        fetch("http://cloud.myhexin.com/pack/api/data/sns", {
            start: formatTime((new Date()).getTime() - 7 * 24 * 60 * 60 * 1000),
            end: formatTime((new Date()).getTime()),
            names: objList.join(','),
            branch
        }).then(res => {
            const data = res.data
            const CIobjList = Object.keys(data)
            let result = new Array()
            CIobjList.forEach(item => {
                if(data[item].ave_time[branch]) {
                    result.push({
                        name: item,
                        ave_time: parseFloat(data[item].ave_time[branch]),
                        max_time: parseFloat(data[item].max_time[branch]),
                        failed: parseFloat(data[item].failed[branch]),
                        count: parseFloat(data[item].count[branch]),
                    })
                }
            })
            resolve(result)
        }).catch(error => {
            reject(error)
        })
    })
}

module.exports = { fetchCI }