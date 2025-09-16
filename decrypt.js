require('dotenv').config();
const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'local_pass'
};

// 加密密钥（必须与导入时使用的密钥相同）
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'mySecretKey123456789012345678901234567890';

/**
 * 查询并解密密码
 * @param {string} searchTerm - 搜索关键词（网站名称、用户名等）
 */
async function decryptPasswords(searchTerm = '') {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    let query, params;
    
    if (searchTerm) {
      // 按关键词搜索
      query = `
        SELECT 
          id,
          name,
          url,
          username,
          AES_DECRYPT(password_encrypted, ?) as password,
          note,
          created_at
        FROM passwords 
        WHERE name LIKE ? OR username LIKE ? OR url LIKE ?
        ORDER BY name
      `;
      params = [ENCRYPTION_KEY, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
    } else {
      // 查询所有记录
      query = `
        SELECT 
          id,
          name,
          url,
          username,
          AES_DECRYPT(password_encrypted, ?) as password,
          note,
          created_at
        FROM passwords 
        ORDER BY name
      `;
      params = [ENCRYPTION_KEY];
    }
    
    const [rows] = await connection.query(query, params);
    
    if (rows.length === 0) {
      console.log('未找到匹配的记录');
      return;
    }
    
    console.log(`\n找到 ${rows.length} 条记录：\n`);
    console.log('='.repeat(100));
    
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name}`);
      console.log(`   URL: ${row.url}`);
      console.log(`   用户名: ${row.username}`);
      console.log(`   密码: ${row.password}`);
      if (row.note) {
        console.log(`   备注: ${row.note}`);
      }
      console.log(`   创建时间: ${row.created_at}`);
      console.log('-'.repeat(80));
    });
    
  } catch (err) {
    console.error('查询失败:', err);
  } finally {
    await connection.end();
  }
}

/**
 * 统计密码信息
 */
async function getPasswordStats() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // 总记录数
    const [countResult] = await connection.query('SELECT COUNT(*) as total FROM passwords');
    console.log(`\n数据库中共有 ${countResult[0].total} 条密码记录\n`);
    
    // 按网站类型统计
    const [groupResult] = await connection.query(`
      SELECT 
        CASE 
          WHEN name LIKE '%google%' THEN 'Google'
          WHEN name LIKE '%facebook%' THEN 'Facebook'
          WHEN name LIKE '%amazon%' THEN 'Amazon'
          WHEN name LIKE '%github%' THEN 'GitHub'
          WHEN name LIKE '%microsoft%' THEN 'Microsoft'
          ELSE '其他'
        END as category,
        COUNT(*) as count
      FROM passwords 
      GROUP BY category
      ORDER BY count DESC
    `);
    
    console.log('按网站类型分组的统计：');
    console.table(groupResult);
    
  } catch (err) {
    console.error('统计失败:', err);
  } finally {
    await connection.end();
  }
}

// 命令行参数处理
const args = process.argv.slice(2);
const command = args[0];
const searchTerm = args[1];

if (command === 'search' && searchTerm) {
  console.log(`正在搜索包含 "${searchTerm}" 的密码记录...`);
  decryptPasswords(searchTerm);
} else if (command === 'stats') {
  getPasswordStats();
} else if (command === 'all') {
  console.log('正在显示所有密码记录...');
  decryptPasswords();
} else {
  console.log(`
密码解密查询工具

使用方法:
  node decrypt.js all                    # 显示所有密码记录
  node decrypt.js search <关键词>        # 搜索特定密码记录
  node decrypt.js stats                  # 显示统计信息

示例:
  node decrypt.js search google          # 搜索包含"google"的记录
  node decrypt.js search @gmail.com      # 搜索Gmail账户
  node decrypt.js search facebook        # 搜索Facebook相关记录
  `);
}
