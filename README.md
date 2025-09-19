# Chrome密码导入MySQL工具

一个用于将Chrome浏览器导出的密码CSV文件导入到MySQL数据库的Node.js工具。

## 📋 功能特性

- 🔐 安全导入Chrome密码数据到MySQL数据库
- 🔒 **密码加密存储** - 使用MySQL AES加密，密码以密文形式存储
- 🔓 **密码解密查询** - 提供专门的解密工具查看密码
- 📁 **多平台支持** - 支持导入多个来源的密码文件，自动标记来源
- 🔄 **智能去重更新** - 自动检测重复记录，相同数据跳过，不同数据更新
- 🌐 **Web管理界面** - 现代化的Web界面，支持增删改查操作
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
   ENCRYPTION_KEY=your_32_character_encryption_key_here
   ```

4. **启动Web应用**
   ```bash
   # 启动Web服务器
   npm run web
   
   # 或者使用开发模式
   npm run dev
   ```
   
   访问 http://localhost:3000 使用Web界面管理密码

## 🌐 Web管理界面

### 功能特性
- **密码列表展示** - 分页显示所有密码记录
- **搜索功能** - 支持按网站名称、用户名、URL搜索
- **添加密码** - 通过Web界面添加新的密码记录
- **编辑密码** - 修改现有密码记录
- **删除密码** - 安全删除不需要的密码记录
- **密码显示/隐藏** - 点击眼睛图标切换密码显示
- **一键复制** - 点击复制按钮快速复制密码
- **统计信息** - 显示总密码数、来源文件数等统计信息
- **响应式设计** - 支持桌面和移动设备

### 使用说明
1. 启动Web服务器后，在浏览器中访问 http://localhost:3000
2. 使用搜索框快速查找特定密码
3. 点击"添加密码"按钮添加新记录
4. 点击编辑按钮修改现有记录
5. 点击删除按钮安全删除记录
6. 使用分页导航浏览大量数据
   
   **注意**：
   - `.env` 文件已添加到 `.gitignore` 中，不会被提交到仓库
   - `ENCRYPTION_KEY` 用于加密/解密密码，建议使用32位随机字符串

4. **准备密码文件**
   
   - 将CSV密码文件放在项目根目录
   - 支持多个文件同时导入（如：Chrome.csv, Firefox.csv, Edge.csv等）
   - 文件名将作为密码来源标记

5. **运行导入**
   ```bash
   # 批量导入所有CSV文件
   npm start
   # 或者
   npm run import
   
   # 导入指定文件
   npm run import-file sources/Chrome.csv
   
   # 使用CLI命令
   node cli.js import                    # 导入所有文件
   node cli.js import sources/Chrome.csv # 导入指定文件
   ```

6. **查看密码（解密）**
   ```bash
   # 查看所有密码
   npm run query all
   # 或者
   node cli.js query all
   
   # 搜索特定密码
   npm run query google
   # 或者
   node cli.js query google
   
   # 查看统计信息
   npm run stats
   # 或者
   node cli.js stats
   ```

7. **高级查询功能**
   ```bash
   # 查找重复网站
   npm run duplicates
   
   # 查找空备注记录
   npm run empty-notes
   
   # 查找最近添加的记录
   npm run recent 5
   
   # 查找弱密码
   npm run weak-passwords
   
   # 按邮箱域名统计
   npm run email-stats
   
   # 验证加密密钥
   npm run validate-key
   ```

8. **创建测试数据**
   ```bash
   # 创建测试CSV文件
   npm run test
   # 或者
   node cli.js test
   ```

## 📁 项目结构

```
pass-to-mysql/
├── src/                    # 源代码目录
│   ├── config/            # 配置文件
│   │   └── database.js    # 数据库和加密配置
│   ├── services/          # 业务逻辑服务
│   │   └── passwordService.js  # 密码管理服务
│   ├── utils/             # 工具类
│   │   ├── database.js    # 数据库操作工具
│   │   ├── fileHandler.js # 文件处理工具
│   │   └── sqlQuery.js    # SQL查询工具
│   ├── sql/               # SQL语句管理
│   │   ├── schema.js      # 表结构SQL
│   │   ├── queries.js     # 查询SQL
│   │   └── index.js       # SQL统一导出
│   └── index.js           # 主程序入口
├── sources/               # 密码文件目录
│   ├── Chrome.csv         # Chrome导出的密码文件
│   ├── Firefox.csv        # Firefox导出的密码文件
│   └── Edge.csv           # Edge导出的密码文件
├── tests/                 # 测试文件
│   └── createTestData.js  # 测试数据生成器
├── docs/                  # 文档目录
│   └── sql-queries.md     # SQL查询语句参考
├── cli.js                 # 命令行接口
├── index.js               # 旧版入口文件（兼容性）
├── import-multiple.js     # 旧版批量导入（兼容性）
├── decrypt.js             # 旧版解密工具（兼容性）
├── package.json           # 项目配置和依赖
├── .gitignore            # Git忽略文件
└── README.md             # 项目说明文档
```

## 🗄️ 数据库结构

程序会自动创建 `passwords` 表，包含以下字段：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键，自增 |
| name | VARCHAR(255) | 网站名称 |
| url | VARCHAR(500) | 网站URL |
| username | VARCHAR(255) | 用户名 |
| password_encrypted | BLOB | **加密后的密码**（使用AES加密） |
| note | TEXT | 备注信息 |
| from | VARCHAR(255) | **密码来源**（文件名，如Chrome、Firefox等） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

**🔒 安全说明**：密码以加密形式存储在 `password_encrypted` 字段中，需要使用正确的密钥才能解密查看。

**🔄 去重机制**：系统会根据 `name`、`url`、`username`、`from` 四个字段的组合来判断记录是否重复。

## 📊 使用示例

### 导入数据
```bash
# 导入单个文件
npm start

# 批量导入所有CSV文件
npm run import

# 导入指定文件
npm run import-file Firefox.csv

# 输出示例：
# 📊 导入完成统计:
#    ✅ 新增记录: 45 条
#    🔄 更新记录: 8 条
#    ⏭️  跳过记录: 12 条
#    📁 来源文件: Chrome
#    🔒 密码已加密存储
```

### 查看密码（解密）
```bash
# 查看所有密码记录
npm run decrypt all

# 搜索包含特定关键词的密码
npm run decrypt search google
npm run decrypt search @gmail.com
npm run decrypt search facebook

# 查看统计信息
npm run decrypt stats
```

### 直接SQL查询（需要解密）

#### 查看加密状态的密码
```sql
-- 查看所有记录（密码为加密状态）
SELECT id, name, url, username, password_encrypted, note, \`from\`, created_at, updated_at FROM passwords;

-- 查看特定网站的加密密码
SELECT * FROM passwords WHERE name LIKE '%google%';
```

#### 解密查看明文密码
```sql
-- 解密查看所有密码（需要正确的密钥）
SELECT 
  id, 
  name, 
  url, 
  username, 
  CAST(AES_DECRYPT(password_encrypted, 'your_encryption_key') AS CHAR) as password,
  note, 
  \`from\`,
  created_at,
  updated_at
FROM passwords 
ORDER BY \`from\`, name;

-- 解密查看特定网站的密码
SELECT 
  id, 
  name, 
  url, 
  username, 
  CAST(AES_DECRYPT(password_encrypted, 'your_encryption_key') AS CHAR) as password,
  note 
FROM passwords 
WHERE name LIKE '%google%';

-- 解密查看特定用户的密码
SELECT 
  id, 
  name, 
  url, 
  username, 
  CAST(AES_DECRYPT(password_encrypted, 'your_encryption_key') AS CHAR) as password,
  note,
  \`from\`
FROM passwords 
WHERE username LIKE '%@gmail.com%';

-- 解密查看特定来源的密码
SELECT 
  id, 
  name, 
  url, 
  username, 
  CAST(AES_DECRYPT(password_encrypted, 'your_encryption_key') AS CHAR) as password,
  note,
  \`from\`
FROM passwords 
WHERE \`from\` = 'Chrome';

-- 解密查看最近添加的密码
SELECT 
  id, 
  name, 
  url, 
  username, 
  CAST(AES_DECRYPT(password_encrypted, 'your_encryption_key') AS CHAR) as password,
  note,
  created_at 
FROM passwords 
ORDER BY created_at DESC 
LIMIT 10;
```

#### 统计查询
```sql
-- 按来源文件统计
SELECT 
  \`from\` as source,
  COUNT(*) as count
FROM passwords 
GROUP BY \`from\`
ORDER BY count DESC;

-- 按网站类型统计
SELECT 
  CASE 
    WHEN name LIKE '%google%' THEN 'Google'
    WHEN name LIKE '%facebook%' THEN 'Facebook'
    WHEN name LIKE '%amazon%' THEN 'Amazon'
    WHEN name LIKE '%microsoft%' THEN 'Microsoft'
    WHEN name LIKE '%github%' THEN 'GitHub'
    ELSE '其他'
  END as category,
  COUNT(*) as count
FROM passwords 
GROUP BY category
ORDER BY count DESC;

-- 按邮箱域名统计
SELECT 
  SUBSTRING_INDEX(username, '@', -1) as email_domain,
  COUNT(*) as count
FROM passwords 
WHERE username LIKE '%@%'
GROUP BY email_domain
ORDER BY count DESC;

-- 统计总记录数
SELECT COUNT(*) as total_passwords FROM passwords;
```

#### 高级查询示例
```sql
-- 查找包含特定关键词的密码（解密后）
SELECT 
  id, 
  name, 
  url, 
  username, 
  CAST(AES_DECRYPT(password_encrypted, 'your_encryption_key') AS CHAR) as password,
  note 
FROM passwords 
WHERE name LIKE '%bank%' 
   OR name LIKE '%pay%' 
   OR name LIKE '%finance%';

-- 查找重复的网站
SELECT 
  name, 
  COUNT(*) as duplicate_count,
  GROUP_CONCAT(username) as usernames
FROM passwords 
GROUP BY name 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 查找空备注的记录
SELECT 
  id, 
  name, 
  url, 
  username, 
  AES_DECRYPT(password_encrypted, 'your_encryption_key') as password
FROM passwords 
WHERE note IS NULL OR note = '';
```

**⚠️ 重要提醒**：
- 将 `'your_encryption_key'` 替换为您实际的加密密钥
- 密钥必须与导入时使用的密钥完全相同
- 建议在安全的网络环境中执行这些查询
- 查询结果包含敏感信息，请妥善处理

**📚 更多SQL查询示例**：
- 查看 `sql-queries.md` 文件获取完整的SQL查询语句参考
- 包含基本查询、高级查询、统计查询等实用示例

## ⚙️ 配置选项

### 数据库配置
通过环境变量配置数据库连接：

```env
# .env 文件
DB_HOST=localhost          # 数据库主机地址
DB_USER=root              # 数据库用户名
DB_PASSWORD=your_password # 数据库密码
DB_NAME=local_pass        # 目标数据库名称
ENCRYPTION_KEY=your_32_character_encryption_key_here  # 加密密钥（32位）
```

**🔑 加密密钥说明**：
- 用于加密/解密密码的密钥
- 建议使用32位随机字符串
- 必须与导入和查询时使用相同的密钥
- 丢失密钥将无法解密密码

### 表结构自定义
如需修改表结构，请编辑 `index.js` 中的建表语句：

```javascript
await connection.query(`
  CREATE TABLE IF NOT EXISTS passwords (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    url VARCHAR(500),
    username VARCHAR(255),
    password_encrypted BLOB,  -- 加密后的密码
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
```

## 🔒 安全注意事项

1. **密码加密**：所有密码使用AES加密存储，不会以明文形式保存
2. **密钥管理**：妥善保管加密密钥，丢失将无法解密密码
3. **数据库安全**：确保数据库连接使用强密码
4. **网络安全**：建议在本地网络环境中使用
5. **文件安全**：CSV文件和.env文件已添加到 `.gitignore`，避免意外提交
6. **权限控制**：为数据库用户设置最小必要权限
7. **密钥轮换**：定期更换加密密钥（需要重新导入数据）

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

4. **解密失败**
   ```
   Error: Incorrect key file
   ```
   - 检查 `ENCRYPTION_KEY` 是否与导入时使用的密钥相同
   - 确保密钥长度正确（建议32位）

5. **密码显示为乱码**
   - 检查加密密钥是否正确
   - 确保使用相同的密钥进行加密和解密

## 📝 开发说明

### 依赖包
- `csv-parser`: 解析CSV文件
- `mysql2`: MySQL数据库连接

### 开发命令
```bash
# 安装依赖
npm install

# 导入密码
npm start

# 查看密码（解密）
npm run decrypt all
npm run decrypt search <关键词>
npm run decrypt stats

# 直接运行脚本
node index.js
node decrypt.js
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
