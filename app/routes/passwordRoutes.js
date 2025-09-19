const Router = require('koa-router');
const multer = require('@koa/multer');
const PasswordController = require('../controllers/passwordController');
const { appConfig } = require('../config/database');

const router = new Router();
const passwordController = new PasswordController();

// 配置multer用于文件上传
const upload = multer({
    dest: appConfig.uploadDir + '/',
    limits: {
        fileSize: appConfig.maxFileSize
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('只支持CSV文件'), false);
        }
    }
});

// 密码相关路由
router.get('/api/passwords', passwordController.getPasswords.bind(passwordController));
router.get('/api/passwords/:id', passwordController.getPasswordById.bind(passwordController));
router.post('/api/passwords', passwordController.createPassword.bind(passwordController));
router.put('/api/passwords/:id', passwordController.updatePassword.bind(passwordController));
router.delete('/api/passwords/:id', passwordController.deletePassword.bind(passwordController));

// 统计信息
router.get('/api/stats', passwordController.getStats.bind(passwordController));

// 导入密码
router.post('/api/import', upload.single('file'), passwordController.importPasswords.bind(passwordController));

// 解密密码
router.post('/api/decrypt', passwordController.decryptPassword.bind(passwordController));

// 测试路由
router.get('/test', async (ctx) => {
    ctx.body = { message: 'Password Manager API is running!' };
});

module.exports = router;
