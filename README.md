# Chrome密码导入MySQL工具

一个用于将Chrome浏览器导出的密码CSV文件导入到MySQL数据库的Node.js工具。

## 📋 功能特性

- 🔐 安全导入Chrome密码数据到MySQL数据库
- 📊 自动创建数据库和表结构
- 🛡️ 数据验证和过滤（只导入有效的用户名和密码）
- 📈 支持批量导入，高效处理大量数据
- 🔧 灵活的数据库配置

## 🚀 快速开始

### 环境要求

- Node.js (版本 14 或更高)
- MySQL 数据库服务器
- Chrome浏览器（用于导出密码）

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd pass-to-mysql
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置数据库**
   
   创建 `.env` 文件并配置数据库连接：
   ```bash
   # 创建环境变量文件
   touch .env
   ```
   
   在 `.env` 文件中添加：
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password_here
   DB_NAME=local_pass
   ```
   
   **注意**：`.env` 文件已添加到 `.gitignore` 中，不会被提交到仓库。

4. **准备Chrome密码文件**
   
   - 打开Chrome浏览器
   - 访问 `chrome://settings/passwords`
   - 点击"导出密码"按钮
   - 将导出的CSV文件重命名为 `Chrome.csv` 并放在项目根目录

5. **运行导入**
   ```bash
   npm start
   # 或者
   node index.js
   ```

## 📁 项目结构

```
pass-to-mysql/
├── Chrome.csv          # Chrome导出的密码文件（已忽略）
├── index.js            # 主程序文件
├── package.json        # 项目配置和依赖
├── .gitignore         # Git忽略文件
└── README.md          # 项目说明文档
```

## 🗄️ 数据库结构

程序会自动创建 `passwords` 表，包含以下字段：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键，自增 |
| name | VARCHAR(255) | 网站名称 |
| url | VARCHAR(500) | 网站URL |
| username | VARCHAR(255) | 用户名 |
| password | VARCHAR(255) | 密码 |
| note | TEXT | 备注信息 |
| created_at | TIMESTAMP | 创建时间 |

## 📊 使用示例

### 导入数据
```bash
# 运行导入程序
npm start

# 输出示例：
# 正在导入数据…
# 成功导入 93 条记录到MySQL数据库
```

### 查询数据
```sql
-- 查看所有密码记录
SELECT * FROM passwords;

-- 按网站类型统计
SELECT 
  CASE 
    WHEN name LIKE '%google%' THEN 'Google'
    WHEN name LIKE '%facebook%' THEN 'Facebook'
    WHEN name LIKE '%amazon%' THEN 'Amazon'
    ELSE '其他'
  END as category,
  COUNT(*) as count
FROM passwords 
GROUP BY category
ORDER BY count DESC;

-- 查找特定网站的密码
SELECT * FROM passwords WHERE name LIKE '%github%';
```

## ⚙️ 配置选项

### 数据库配置
通过环境变量配置数据库连接：

```env
# .env 文件
DB_HOST=localhost          # 数据库主机地址
DB_USER=root              # 数据库用户名
DB_PASSWORD=your_password # 数据库密码
DB_NAME=local_pass        # 目标数据库名称
```

或者直接在代码中修改默认值（不推荐用于生产环境）。

### 表结构自定义
如需修改表结构，请编辑 `index.js` 中的建表语句：

```javascript
await connection.query(`
  CREATE TABLE IF NOT EXISTS passwords (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    url VARCHAR(500),
    username VARCHAR(255),
    password VARCHAR(255),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
```

## 🔒 安全注意事项

1. **密码保护**：确保数据库连接使用强密码
2. **网络安全**：建议在本地网络环境中使用
3. **文件安全**：CSV文件已添加到 `.gitignore`，避免意外提交
4. **权限控制**：为数据库用户设置最小必要权限

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**
   ```
   Error: Unknown database 'local_pass'
   ```
   - 检查数据库配置是否正确
   - 确保MySQL服务正在运行
   - 验证用户权限

2. **CSV文件读取失败**
   ```
   Error: ENOENT: no such file or directory
   ```
   - 确保 `Chrome.csv` 文件存在于项目根目录
   - 检查文件权限

3. **导入数据为空**
   - 检查CSV文件格式是否正确
   - 确保包含 `name`, `url`, `username`, `password` 字段

## 📝 开发说明

### 依赖包
- `csv-parser`: 解析CSV文件
- `mysql2`: MySQL数据库连接

### 开发命令
```bash
# 安装依赖
npm install

# 运行程序
npm start

# 查看帮助
npm run help
```

## 📄 许可证

ISC License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 📞 支持

如果您遇到任何问题，请：
1. 检查本文档的故障排除部分
2. 查看项目的Issue页面
3. 创建新的Issue描述您的问题

---

**⚠️ 重要提醒**：此工具处理敏感的密码数据，请确保在安全的环境中使用，并妥善保护您的数据库和文件。
