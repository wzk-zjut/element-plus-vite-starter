const Koa = require('koa')
const router = require('koa-router')();
const cors = require('koa2-cors')
const getSign = require('./utils/getSign')
const fetchCD = require('./utils/fetchCD')
const {
    getCache,
    cacheCD
} = require('./utils/cacheCD');


const app = new Koa();

// 解决跨域
app.use(cors({
    origin: (ctx) => {
        return '*'
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS', 'PUT'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}))

router.get('/getCdTime', async ctx => {
    const urlParmas = ctx.request.query
    if (urlParmas.noCache !== 1) {
        const cache = await getCache(urlParmas)
        if (cache !== 'noCache') {
            // 有缓存
            ctx.body = {
                code: 1,
                msg: "查询成功",
                data: cache
            }
            return
        }
    }
    const obj = {
        app_key: '100000013',
        sign_method: 'md5',
        v: '1.0',
    }
    const sign = await getSign({
        ...urlParmas,
        ...obj
    })
    urlParmas.sign = sign
    let res = {}
    try {
        res = await fetchCD(urlParmas)
        if (JSON.parse(res).code == 1) {
            delete urlParmas.sign
            delete urlParmas.noCache
            await cacheCD(JSON.parse(res).data, urlParmas)
        }
    } catch (error) {
        res = {
            code: 500,
            msg: "获取CD数据失败"
        }
    }
    ctx.body = res
})

app.use(router.routes())
app.use(router.allowedMethods())


// 在端口7280监听:
app.listen(7280, () => {
    console.log('服务开启')
});