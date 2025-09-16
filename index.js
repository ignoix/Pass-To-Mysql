require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'local_pass'
};

// 加密密钥（建议使用环境变量）
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'mySecretKey123456789012345678901234567890';

// 读取 CSV 并插入数据库
async function importPasswords(filePath) {
  // 从文件路径提取文件名（不包含扩展名）
  const fileName = path.basename(filePath, path.extname(filePath));
  // 先连接到MySQL服务器（不指定数据库）
  const tempConnection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password
  });
  
  // 创建数据库（如果不存在）
  await tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
  await tempConnection.end();
  
  // 连接到指定数据库
  const connection = await mysql.createConnection(dbConfig);

  // 确保 passwords 表存在
  await connection.query(`
    CREATE TABLE IF NOT EXISTS passwords (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      url VARCHAR(500),
      username VARCHAR(255),
      password_encrypted BLOB,
      note TEXT,
      \`from\` VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_password (name(100), url(200), username(100), \`from\`(50))
    )
  `);

  console.log('正在导入数据…');

  const rows = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      // 读取CSV格式的字段
      const name = row.name || '';
      const url = row.url || '';
      const username = row.username || '';
      const password = row.password || '';
      const note = row.note || '';
      
      // 只有当用户名和密码都存在时才添加记录
      if (username && password) {
        rows.push([name, url, username, password, note, fileName]);
      }
    })
    .on('end', async () => {
      try {
        let insertedCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;
        
        for (const [name, url, username, password, note, from] of rows) {
          // 检查记录是否已存在
          const [existing] = await connection.query(
            'SELECT id, password_encrypted FROM passwords WHERE name = ? AND url = ? AND username = ? AND `from` = ?',
            [name, url, username, from]
          );
          
          if (existing.length > 0) {
            // 记录已存在，检查密码是否相同
            const [decrypted] = await connection.query(
              'SELECT AES_DECRYPT(password_encrypted, ?) as decrypted_password FROM passwords WHERE id = ?',
              [ENCRYPTION_KEY, existing[0].id]
            );
            
            if (decrypted[0].decrypted_password && decrypted[0].decrypted_password.toString() === password) {
              // 密码相同，跳过
              skippedCount++;
              continue;
            } else {
              // 密码不同，更新记录
              await connection.query(
                'UPDATE passwords SET password_encrypted = AES_ENCRYPT(?, ?), note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [password, ENCRYPTION_KEY, note, existing[0].id]
              );
              updatedCount++;
            }
          } else {
            // 记录不存在，插入新记录
            await connection.query(
              'INSERT INTO passwords (name, url, username, password_encrypted, note, `from`) VALUES (?, ?, ?, AES_ENCRYPT(?, ?), ?, ?)',
              [name, url, username, password, ENCRYPTION_KEY, note, from]
            );
            insertedCount++;
          }
        }
        
        console.log(`\n📊 导入完成统计:`);
        console.log(`   ✅ 新增记录: ${insertedCount} 条`);
        console.log(`   🔄 更新记录: ${updatedCount} 条`);
        console.log(`   ⏭️  跳过记录: ${skippedCount} 条`);
        console.log(`   📁 来源文件: ${fileName}`);
        console.log(`   🔒 密码已加密存储`);
        
      } catch (err) {
        console.error('导入失败:', err);
      } finally {
        await connection.end();
      }
    });
}

// 入口
const csvFilePath = path.join(__dirname, 'Chrome.csv');
importPasswords(csvFilePath).catch((err) => console.error(err));
