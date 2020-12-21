const crypto = require('crypto')

// 获取sign
const getSign = (params) => {
    let arr = [],
        str = '',
        secret = 'o2wpgjgajtcww7xly4vpubwijubczl6f'

    val => arr.push(val.join(''))

    Object.keys(params).map(val => arr.push(val))
    arr.sort().map(val => {
        str += val + params[val]
    })

    str = secret + str + secret

    const md5 = crypto.createHash('md5')
    md5.update(str)
    const sign = md5.digest('hex').toUpperCase();
    return sign
}

module.exports = getSign