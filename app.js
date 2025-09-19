require('dotenv').config();
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const path = require('path');

// 导入中间件
const cors = require('./app/middleware/cors');
const logger = require('./app/middleware/logger');

// 导入路由
const passwordRoutes = require('./app/routes/passwordRoutes');

// 导入工具类
const { EnvUtils, Database } = require('./app/utils');

const app = new Koa();

// 中间件
app.use(logger());
app.use(cors());
app.use(bodyParser());

// 静态文件服务 - 先提供views目录中的HTML文件
app.use(serve(path.join(__dirname, 'app/views')));
// 再提供public目录中的静态资源
app.use(serve(path.join(__dirname, 'public')));

// 路由
app.use(passwordRoutes.routes());
app.use(passwordRoutes.allowedMethods());

// 根路径重定向到首页
app.use(async (ctx) => {
    if (ctx.path === '/') {
        ctx.redirect('/index.html');
    }
});

// 初始化数据库
async function initializeDatabase() {
    try {
        const db = new Database();
        await db.ensureTable();
        EnvUtils.silentInProduction(() => {
            console.log('✅ 数据库初始化完成');
        });
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error.message);
        process.exit(1);
    }
}

const PORT = process.env.PORT || 3000;

// 启动应用
async function startApp() {
    await initializeDatabase();
    
    app.listen(PORT, () => {
        EnvUtils.silentInProduction(() => {
            console.log(`🚀 密码管理系统启动成功！`);
            console.log(`📱 访问地址: http://localhost:${PORT}`);
            console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
        });
    });
}

startApp().catch(error => {
    console.error('❌ 应用启动失败:', error.message);
    process.exit(1);
});

module.exports = app;
