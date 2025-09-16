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

// 读取 CSV 并插入数据库
async function importChromePasswords(filePath) {
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
      password VARCHAR(255),
      note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('正在导入数据…');

  const rows = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      // 读取Chrome CSV格式的字段
      const name = row.name || '';
      const url = row.url || '';
      const username = row.username || '';
      const password = row.password || '';
      const note = row.note || '';
      
      // 只有当用户名和密码都存在时才添加记录
      if (username && password) {
        rows.push([name, url, username, password, note]);
      }
    })
    .on('end', async () => {
      try {
        for (const [name, url, username, password, note] of rows) {
          await connection.query(
            'INSERT INTO passwords (name, url, username, password, note) VALUES (?, ?, ?, ?, ?)',
            [name, url, username, password, note]
          );
        }
        console.log(`成功导入 ${rows.length} 条记录到MySQL数据库`);
      } catch (err) {
        console.error('导入失败:', err);
      } finally {
        await connection.end();
      }
    });
}

// 入口
const csvFilePath = path.join(__dirname, 'Chrome.csv');
importChromePasswords(csvFilePath).catch((err) => console.error(err));
