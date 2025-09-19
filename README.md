# 密码管理系统

一个基于Node.js + Koa2 + MySQL的现代化密码管理系统，采用MVC架构设计，支持密码加密存储、Web界面管理、CSV文件导入等功能。

## ✨ 功能特性

- 🔐 **安全加密**: 使用crypto-js AES加密存储密码
- 🌐 **Web界面**: 现代化的响应式Web管理界面
- 📊 **数据统计**: 密码数量、来源分布等统计信息
- 📁 **文件导入**: 支持CSV格式密码文件批量导入
- 🔍 **智能搜索**: 支持按网站名、用户名等字段搜索
- 📱 **响应式设计**: 完美适配桌面和移动设备
- 🎨 **现代UI**: 基于Bootstrap 5的美观界面

## 🏗️ 项目结构

```
pass-to-mysql/
├── app/                    # MVC架构核心目录
│   ├── config/            # 配置文件
│   │   └── database.js    # 数据库配置
│   ├── controllers/       # 控制器
│   │   └── passwordController.js
│   ├── middleware/        # 中间件
│   │   ├── cors.js       # CORS中间件
│   │   └── logger.js     # 日志中间件
│   ├── models/           # 数据模型
│   │   └── Password.js   # 密码模型
│   ├── routes/           # 路由
│   │   └── passwordRoutes.js
│   ├── sql/              # SQL语句
│   │   ├── schema.js     # 数据库结构
│   │   └── queries.js    # 查询语句
│   ├── utils/            # 工具类
│   │   ├── crypto.js     # 加密工具
│   │   ├── database.js   # 数据库工具
│   │   └── fileHandler.js # 文件处理工具
│   └── views/            # 视图模板
│       └── index.html    # 主页面
├── public/               # 静态资源
│   ├── css/             # 样式文件
│   ├── js/              # JavaScript文件
│   │   └── app.js       # 前端逻辑
│   └── images/          # 图片资源
├── uploads/             # 上传文件目录
├── .env                 # 环境变量配置
├── .gitignore          # Git忽略文件
├── app.js              # 应用入口文件
├── package.json        # 项目配置
└── README.md           # 项目说明
```

## 🚀 快速开始

### 1. 环境要求

- Node.js >= 14.0.0
- MySQL >= 5.7
- npm 或 yarn

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=pass_manager

# 加密密钥
CRYPTO_KEY=your_32_character_encryption_key_here

# 服务器配置
PORT=3000
NODE_ENV=development
```

### 4. 启动应用

```bash
# 生产环境
npm start

# 开发环境（自动重启）
npm run dev
```

### 5. 访问应用

打开浏览器访问：http://localhost:3000

## 📖 使用说明

### Web管理界面

1. **查看密码列表**: 首页显示所有密码记录
2. **搜索密码**: 使用搜索框按网站名、用户名等搜索
3. **添加密码**: 点击"添加密码"按钮创建新记录
4. **编辑密码**: 点击编辑按钮修改现有记录
5. **删除密码**: 点击删除按钮安全删除记录
6. **导入密码**: 点击"导入"按钮上传CSV文件
7. **解密查看**: 点击眼睛图标输入密钥查看明文密码

### 密码安全

- 所有密码使用AES加密存储
- 查看明文需要输入正确的解密密钥
- 支持复制密文和明文密码
- 密钥错误时显示友好提示

### 文件导入

支持的CSV格式：
```csv
name,url,username,password,note
google.com,https://google.com,user@example.com,password123,备注信息
```

## 🔧 技术栈

- **后端**: Node.js + Koa2
- **数据库**: MySQL + mysql2
- **加密**: crypto-js
- **前端**: HTML5 + CSS3 + JavaScript + Bootstrap 5
- **文件处理**: multer + csv-parser
- **架构**: MVC模式

## 📝 API接口

### 密码管理
- `GET /api/passwords` - 获取密码列表
- `GET /api/passwords/:id` - 获取单个密码
- `POST /api/passwords` - 创建密码
- `PUT /api/passwords/:id` - 更新密码
- `DELETE /api/passwords/:id` - 删除密码

### 其他功能
- `GET /api/stats` - 获取统计信息
- `POST /api/import` - 导入CSV文件
- `POST /api/decrypt` - 解密密码

## 🛡️ 安全注意事项

- 妥善保管加密密钥，建议使用32位随机字符串
- 定期备份数据库
- 在生产环境中使用HTTPS
- 限制数据库访问权限
- 定期更新依赖包

## 📄 许可证

ISC License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 支持

如有问题，请提交Issue或联系开发者。