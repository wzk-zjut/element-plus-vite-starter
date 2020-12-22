const Koa = require('koa')
const router = require('koa-router')();
const cors = require('koa2-cors')
const getSign = require('./utils/getSign')
const fetchCD = require('./utils/fetchCD')
const { getCDData } = require('./utils/releaseData')
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

// 获取CD发布时间接口
// 除了CD提供方可以传的参数还可以传noCache为1。这时数据不走缓存但会更新缓存
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
        }
    } catch (error) {
        res = {
            code: 500,
            msg: "获取CD数据失败"
        }
        return
    }
    ctx.body = res
    await cacheCD(JSON.parse(res).data, urlParmas)
})

// 发布数据集合接口
// 接收参数 env:prod | test
router.get('/releaseData', async ctx => {
    const urlParmas = ctx.request.query
    if(!urlParmas.env) {
        ctx.body = {
            errorCode: 100,
            errorMsg: "缺少env参数"
        }
        return
    }
    let res = new Object()
    try{
        const CDData = await getCDData('prod')
        res = {
            errorCode: 0,
            errorMsg: "success",
            result: {
                CD: CDData
            }
        }
    } catch (error) {
        res = {
            errorCode: 500,
            errorMsg: error
        }
        ctx.body = res;
        return;
    }
    ctx.body = res;
})

app.use(router.routes())
app.use(router.allowedMethods())


// 在端口7280监听:
app.listen(7280, () => {
    console.log('服务开启')
});