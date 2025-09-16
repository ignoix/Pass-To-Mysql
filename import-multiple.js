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

// 加密密钥
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'mySecretKey123456789012345678901234567890';

/**
 * 导入单个CSV文件
 */
async function importPasswords(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  console.log(`\n📁 正在处理文件: ${fileName}`);
  
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

  const rows = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const name = row.name || '';
        const url = row.url || '';
        const username = row.username || '';
        const password = row.password || '';
        const note = row.note || '';
        
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
                skippedCount++;
                continue;
              } else {
                await connection.query(
                  'UPDATE passwords SET password_encrypted = AES_ENCRYPT(?, ?), note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                  [password, ENCRYPTION_KEY, note, existing[0].id]
                );
                updatedCount++;
              }
            } else {
              await connection.query(
                'INSERT INTO passwords (name, url, username, password_encrypted, note, `from`) VALUES (?, ?, ?, AES_ENCRYPT(?, ?), ?, ?)',
                [name, url, username, password, ENCRYPTION_KEY, note, from]
              );
              insertedCount++;
            }
          }
          
          console.log(`   ✅ 新增: ${insertedCount} 条`);
          console.log(`   🔄 更新: ${updatedCount} 条`);
          console.log(`   ⏭️  跳过: ${skippedCount} 条`);
          
          resolve({ insertedCount, updatedCount, skippedCount, fileName });
          
        } catch (err) {
          reject(err);
        } finally {
          await connection.end();
        }
      })
      .on('error', reject);
  });
}

/**
 * 批量导入多个CSV文件
 */
async function importMultipleFiles() {
  const csvDir = __dirname;
  const csvFiles = fs.readdirSync(csvDir)
    .filter(file => file.endsWith('.csv'))
    .map(file => path.join(csvDir, file));
  
  if (csvFiles.length === 0) {
    console.log('❌ 未找到CSV文件');
    return;
  }
  
  console.log(`🔍 找到 ${csvFiles.length} 个CSV文件:`);
  csvFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${path.basename(file)}`);
  });
  
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  
  for (const filePath of csvFiles) {
    try {
      const result = await importPasswords(filePath);
      totalInserted += result.insertedCount;
      totalUpdated += result.updatedCount;
      totalSkipped += result.skippedCount;
    } catch (err) {
      console.error(`❌ 处理文件 ${path.basename(filePath)} 失败:`, err.message);
    }
  }
  
  console.log(`\n🎉 批量导入完成!`);
  console.log(`   📊 总计统计:`);
  console.log(`   ✅ 新增记录: ${totalInserted} 条`);
  console.log(`   🔄 更新记录: ${totalUpdated} 条`);
  console.log(`   ⏭️  跳过记录: ${totalSkipped} 条`);
  console.log(`   🔒 所有密码已加密存储`);
}

// 命令行参数处理
const args = process.argv.slice(2);

if (args.length === 0) {
  // 没有参数，批量导入所有CSV文件
  importMultipleFiles().catch(console.error);
} else {
  // 有参数，导入指定文件
  const filePath = path.resolve(args[0]);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ 文件不存在: ${filePath}`);
    process.exit(1);
  }
  
  importPasswords(filePath)
    .then(result => {
      console.log(`\n🎉 导入完成!`);
      console.log(`   📁 文件: ${result.fileName}`);
      console.log(`   ✅ 新增: ${result.insertedCount} 条`);
      console.log(`   🔄 更新: ${result.updatedCount} 条`);
      console.log(`   ⏭️  跳过: ${result.skippedCount} 条`);
    })
    .catch(console.error);
}
