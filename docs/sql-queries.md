# MySQL 密码查询 SQL 语句参考

## 🔑 基本查询

### 查看所有密码（解密）
```sql
SELECT 
  id, 
  name, 
  url, 
  username, 
  CAST(AES_DECRYPT(password_encrypted, 'mySecretKey123456789012345678901234567890') AS CHAR) as password,
  note, 
  created_at 
FROM passwords 
ORDER BY name;
```

### 查看特定网站的密码
```sql
-- 搜索包含 "google" 的网站
SELECT 
  id, 
  name, 
  url, 
  username, 
  CAST(AES_DECRYPT(password_encrypted, 'mySecretKey123456789012345678901234567890') AS CHAR) as password,
  note 
FROM passwords 
WHERE name LIKE '%google%';
```

### 查看特定用户的密码
```sql
-- 搜索 Gmail 账户
SELECT 
  id, 
  name, 
  url, 
  username, 
  CAST(AES_DECRYPT(password_encrypted, 'mySecretKey123456789012345678901234567890') AS CHAR) as password,
  note 
FROM passwords 
WHERE username LIKE '%@gmail.com%';
```

## 🔍 高级查询

### 按网站类型查找
```sql
-- 查找银行/金融相关网站
SELECT 
  id, 
  name, 
  url, 
  username, 
  CAST(AES_DECRYPT(password_encrypted, 'mySecretKey123456789012345678901234567890') AS CHAR) as password,
  note 
FROM passwords 
WHERE name LIKE '%bank%' 
   OR name LIKE '%pay%' 
   OR name LIKE '%finance%'
   OR name LIKE '%credit%';
```

### 查找重复网站
```sql
SELECT 
  name, 
  COUNT(*) as duplicate_count,
  GROUP_CONCAT(username) as usernames
FROM passwords 
GROUP BY name 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;
```

### 查找最近添加的密码
```sql
SELECT 
  id, 
  name, 
  url, 
  username, 
  CAST(AES_DECRYPT(password_encrypted, 'mySecretKey123456789012345678901234567890') AS CHAR) as password,
  note,
  created_at 
FROM passwords 
ORDER BY created_at DESC 
LIMIT 10;
```

## 📊 统计查询

### 按网站类型统计
```sql
SELECT 
  CASE 
    WHEN name LIKE '%google%' THEN 'Google'
    WHEN name LIKE '%facebook%' THEN 'Facebook'
    WHEN name LIKE '%amazon%' THEN 'Amazon'
    WHEN name LIKE '%microsoft%' THEN 'Microsoft'
    WHEN name LIKE '%github%' THEN 'GitHub'
    WHEN name LIKE '%apple%' THEN 'Apple'
    WHEN name LIKE '%twitter%' OR name LIKE '%x.com%' THEN 'Twitter/X'
    ELSE '其他'
  END as category,
  COUNT(*) as count
FROM passwords 
GROUP BY category
ORDER BY count DESC;
```

### 按邮箱域名统计
```sql
SELECT 
  SUBSTRING_INDEX(username, '@', -1) as email_domain,
  COUNT(*) as count
FROM passwords 
WHERE username LIKE '%@%'
GROUP BY email_domain
ORDER BY count DESC;
```

### 总记录数统计
```sql
SELECT COUNT(*) as total_passwords FROM passwords;
```

## 🛠️ 实用查询

### 查找空备注的记录
```sql
SELECT 
  id, 
  name, 
  url, 
  username, 
  AES_DECRYPT(password_encrypted, 'mySecretKey123456789012345678901234567890') as password
FROM passwords 
WHERE note IS NULL OR note = '';
```

### 查找特定长度的密码
```sql
-- 查找密码长度小于8位的记录
SELECT 
  id, 
  name, 
  url, 
  username, 
  CAST(AES_DECRYPT(password_encrypted, 'mySecretKey123456789012345678901234567890') AS CHAR) as password,
  LENGTH(AES_DECRYPT(password_encrypted, 'mySecretKey123456789012345678901234567890')) as password_length
FROM passwords 
WHERE LENGTH(AES_DECRYPT(password_encrypted, 'mySecretKey123456789012345678901234567890')) < 8;
```

### 查找包含特殊字符的密码
```sql
-- 查找包含数字和特殊字符的密码
SELECT 
  id, 
  name, 
  url, 
  username, 
  AES_DECRYPT(password_encrypted, 'mySecretKey123456789012345678901234567890') as password
FROM passwords 
WHERE AES_DECRYPT(password_encrypted, 'mySecretKey123456789012345678901234567890') REGEXP '[0-9]'
  AND AES_DECRYPT(password_encrypted, 'mySecretKey123456789012345678901234567890') REGEXP '[!@#$%^&*()_+=\[\]{}|;:,.<>?]';
```

## 🔒 安全查询

### 查看加密状态（不解密）
```sql
-- 查看所有记录（密码为加密状态）
SELECT id, name, url, username, password_encrypted, note, created_at FROM passwords;
```

### 验证加密密钥
```sql
-- 测试密钥是否正确（如果返回NULL说明密钥错误）
SELECT 
  name,
  AES_DECRYPT(password_encrypted, 'mySecretKey123456789012345678901234567890') as password
FROM passwords 
LIMIT 1;
```

## 📝 使用说明

1. **替换密钥**：将所有的 `'mySecretKey123456789012345678901234567890'` 替换为您实际的加密密钥
2. **安全环境**：建议在安全的网络环境中执行这些查询
3. **结果处理**：查询结果包含敏感信息，请妥善处理
4. **权限控制**：确保只有授权用户能够访问数据库

## 🚨 注意事项

- 密钥必须与导入时使用的密钥完全相同
- 建议定期备份数据库
- 在生产环境中使用时要格外小心
- 考虑使用数据库视图来限制敏感字段的访问
