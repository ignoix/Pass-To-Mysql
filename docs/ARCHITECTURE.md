# 项目架构说明

## 🏗️ 整体架构

本项目采用模块化设计，将功能按职责分离到不同的目录和文件中。

## 📁 目录结构

```
pass-to-mysql/
├── src/                    # 源代码目录
│   ├── config/            # 配置模块
│   │   └── database.js    # 数据库和加密配置
│   ├── services/          # 业务逻辑层
│   │   └── passwordService.js  # 密码管理服务
│   ├── utils/             # 工具层
│   │   ├── database.js    # 数据库操作工具
│   │   └── fileHandler.js # 文件处理工具
│   └── index.js           # 主程序入口
├── sources/               # 数据源目录
│   ├── Chrome.csv         # Chrome密码文件
│   ├── Firefox.csv        # Firefox密码文件
│   └── Edge.csv           # Edge密码文件
├── tests/                 # 测试目录
│   └── createTestData.js  # 测试数据生成器
├── docs/                  # 文档目录
│   ├── sql-queries.md     # SQL查询参考
│   └── ARCHITECTURE.md    # 架构说明
├── cli.js                 # 命令行接口
└── package.json           # 项目配置
```

## 🔧 模块说明

### 配置模块 (`src/config/`)

**database.js** - 统一管理所有配置
- 数据库连接配置
- 加密密钥配置
- 应用参数配置

### 工具模块 (`src/utils/`)

**database.js** - 数据库操作工具类
- 连接管理
- 表结构管理
- CRUD操作
- 查询和统计

**fileHandler.js** - 文件处理工具类
- CSV文件解析
- 文件验证
- 测试数据生成

### 服务模块 (`src/services/`)

**passwordService.js** - 密码管理服务
- 导入逻辑
- 去重更新
- 查询功能
- 统计功能

### 入口模块

**src/index.js** - 主程序入口
- 封装服务调用
- 错误处理
- 资源管理

**cli.js** - 命令行接口
- 参数解析
- 命令分发
- 用户交互

## 🔄 数据流程

1. **文件发现** → `fileHandler.getCsvFiles()`
2. **文件解析** → `fileHandler.parseCsvFile()`
3. **数据库连接** → `database.connect()`
4. **表结构确保** → `database.ensureTable()`
5. **数据去重** → `database.findExisting()`
6. **密码比较** → `database.comparePassword()`
7. **数据操作** → `database.insert()` / `database.update()`
8. **资源清理** → `database.close()`

## 🎯 设计原则

### 1. 单一职责原则
每个模块只负责一个特定的功能领域。

### 2. 依赖注入
通过构造函数或参数传递依赖，便于测试和扩展。

### 3. 错误处理
统一的错误处理机制，确保程序稳定性。

### 4. 资源管理
自动管理数据库连接等资源，避免内存泄漏。

### 5. 配置分离
将配置信息集中管理，便于环境切换。

## 🚀 扩展指南

### 添加新的数据源
1. 在 `sources/` 目录添加新的CSV文件
2. 确保CSV格式符合标准（name, url, username, password, note）
3. 运行 `npm run import` 自动导入

### 添加新的查询功能
1. 在 `database.js` 中添加新的查询方法
2. 在 `passwordService.js` 中封装业务逻辑
3. 在 `cli.js` 中添加新的命令

### 添加新的配置项
1. 在 `src/config/database.js` 中添加配置
2. 在 `.env` 文件中添加环境变量
3. 在相关模块中使用新配置

## 🔒 安全考虑

1. **密码加密** - 所有密码使用AES加密存储
2. **密钥管理** - 加密密钥通过环境变量管理
3. **文件隔离** - 敏感文件放在独立目录
4. **权限控制** - 数据库用户最小权限原则

## 📊 性能优化

1. **连接池** - 复用数据库连接
2. **批量操作** - 减少数据库交互次数
3. **索引优化** - 使用前缀索引避免长度限制
4. **内存管理** - 及时释放资源

## 🧪 测试策略

1. **单元测试** - 测试各个工具类
2. **集成测试** - 测试服务层功能
3. **端到端测试** - 测试完整流程
4. **性能测试** - 测试大数据量处理

## 📝 开发规范

1. **代码风格** - 使用ES6+语法
2. **注释规范** - 重要函数添加JSDoc注释
3. **错误处理** - 统一错误格式和日志
4. **版本控制** - 遵循语义化版本规范
