const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const path = require('path');
const multer = require('@koa/multer');
const fs = require('fs');
const PasswordManager = require('./src/index');

const app = new Koa();
const router = new Router();

// 配置multer用于文件上传
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB限制
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('只支持CSV文件'), false);
    }
  }
});

// 中间件
// 手动CORS中间件
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  
  if (ctx.method === 'OPTIONS') {
    ctx.status = 200;
    return;
  }
  
  await next();
});

app.use(bodyParser());

// 请求日志中间件
app.use(async (ctx, next) => {
  console.log(`${ctx.method} ${ctx.url}`);
  await next();
});

// 初始化密码管理器
const passwordManager = new PasswordManager();

// 测试路由
router.get('/test', async (ctx) => {
  ctx.body = { message: '服务器正常运行' };
});

// // API路由
router.get('/api/passwords', async (ctx) => {
  try {
    const { search = '', page = 1, limit = 20 } = ctx.query;
    const result = await passwordManager.query(search, parseInt(page), parseInt(limit));
    ctx.body = {
      success: true,
      data: result.passwords,
      total: result.total,
      page: parseInt(page),
      limit: parseInt(limit)
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: error.message
    };
  }
});

router.get('/api/passwords/:id', async (ctx) => {
  try {
    const { id } = ctx.params;
    const result = await passwordManager.query('', 1, 1, id);
    if (result.passwords.length === 0) {
      ctx.status = 404;
      ctx.body = { success: false, message: '密码记录未找到' };
      return;
    }
    ctx.body = {
      success: true,
      data: result.passwords[0]
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: error.message
    };
  }
});

router.post('/api/passwords', async (ctx) => {
  try {
    const { name, url, username, password, note, from } = ctx.request.body;
    
    if (!name || !url || !username || !password) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '缺少必填字段'
      };
      return;
    }

    const result = await passwordManager.addPassword({
      name,
      url,
      username,
      password,
      note: note || '',
      from: from || 'web'
    });

    ctx.body = {
      success: true,
      data: result,
      message: '密码添加成功'
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: error.message
    };
  }
});

router.put('/api/passwords/:id', async (ctx) => {
  try {
    const { id } = ctx.params;
    const { name, url, username, password, note, from } = ctx.request.body;
    
    if (!name || !url || !username || !password) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '缺少必填字段'
      };
      return;
    }

    const result = await passwordManager.updatePassword(id, {
      name,
      url,
      username,
      password,
      note: note || '',
      from: from || 'web'
    });

    ctx.body = {
      success: true,
      data: result,
      message: '密码更新成功'
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: error.message
    };
  }
});

router.delete('/api/passwords/:id', async (ctx) => {
  try {
    const { id } = ctx.params;
    const result = await passwordManager.deletePassword(id);
    
    ctx.body = {
      success: true,
      data: result,
      message: '密码删除成功'
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: error.message
    };
  }
});

router.get('/api/stats', async (ctx) => {
  try {
    const stats = await passwordManager.stats();
    ctx.body = {
      success: true,
      data: stats
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: error.message
    };
  }
});

// 解密密码API
router.post('/api/decrypt', async (ctx) => {
  try {
    const { encryptedPassword, key } = ctx.request.body;
    
    if (!encryptedPassword || !key) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '缺少必要参数'
      };
      return;
    }

    // 使用提供的密钥解密
    const Crypto = require('./src/utils/crypto');
    const crypto = new Crypto(key);
    
    try {
      const decryptedPassword = crypto.decrypt(encryptedPassword);
      ctx.body = {
        success: true,
        data: { password: decryptedPassword }
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '密钥错误或密码格式不正确'
      };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: error.message
    };
  }
});

// 导入密码API
router.post('/api/import', upload.single('file'), async (ctx) => {
  try {
    if (!ctx.request.file) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '请选择要导入的CSV文件'
      };
      return;
    }

    const { source = 'Chrome' } = ctx.request.body;
    const filePath = ctx.request.file.path;
    const fileName = ctx.request.file.originalname;

    // 调用导入功能
    const result = await passwordManager.importPasswords(filePath, source);

    // 删除临时文件
    fs.unlinkSync(filePath);

    ctx.body = {
      success: true,
      data: result,
      message: `导入完成！新增 ${result.inserted} 条，更新 ${result.updated} 条，跳过 ${result.skipped} 条`
    };
  } catch (error) {
    // 清理临时文件
    if (ctx.request.file && fs.existsSync(ctx.request.file.path)) {
      fs.unlinkSync(ctx.request.file.path);
    }
    
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: error.message
    };
  }
});

// 首页路由
router.get('/', async (ctx) => {
  ctx.redirect('/index.html');
});

// 使用路由
app.use(router.routes()).use(router.allowedMethods());

// 静态文件服务（放在路由之后）
app.use(serve(path.join(__dirname, 'public')));

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Web服务器已启动: http://localhost:${PORT}`);
  console.log(`📊 密码管理界面: http://localhost:${PORT}/index.html`);
});

module.exports = app;
