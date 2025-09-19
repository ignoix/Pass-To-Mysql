/**
 * 请求日志中间件
 */
module.exports = () => {
    return async (ctx, next) => {
        const start = Date.now();
        await next();
        const ms = Date.now() - start;
        console.log(`${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`);
    };
};
