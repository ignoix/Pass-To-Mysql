/**
 * CORS中间件
 */
module.exports = () => {
    return async (ctx, next) => {
        // 设置CORS头
        ctx.set('Access-Control-Allow-Origin', '*');
        ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        ctx.set('Access-Control-Allow-Credentials', 'true');

        // 处理预检请求
        if (ctx.method === 'OPTIONS') {
            ctx.status = 200;
            return;
        }

        await next();
    };
};
