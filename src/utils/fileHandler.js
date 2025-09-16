const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { appConfig } = require('../config/database');

/**
 * 文件处理工具类
 */
class FileHandler {
  /**
   * 获取所有CSV文件
   */
  static getCsvFiles(directory = appConfig.sourcesDir) {
    if (!fs.existsSync(directory)) {
      return [];
    }
    
    return fs.readdirSync(directory)
      .filter(file => file.endsWith('.csv'))
      .map(file => path.join(directory, file));
  }

  /**
   * 从文件路径提取文件名（不包含扩展名）
   */
  static getFileName(filePath) {
    return path.basename(filePath, path.extname(filePath));
  }

  /**
   * 解析CSV文件
   */
  static parseCsvFile(filePath) {
    return new Promise((resolve, reject) => {
      const rows = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const name = row.name || '';
          const url = row.url || '';
          const username = row.username || '';
          const password = row.password || '';
          const note = row.note || '';
          
          // 只有当用户名和密码都存在时才添加记录
          if (username && password) {
            rows.push({
              name,
              url,
              username,
              password,
              note,
              from: this.getFileName(filePath)
            });
          }
        })
        .on('end', () => {
          resolve(rows);
        })
        .on('error', reject);
    });
  }

  /**
   * 验证CSV文件格式
   */
  static validateCsvFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }
    
    if (!filePath.endsWith('.csv')) {
      throw new Error(`文件格式错误，需要CSV文件: ${filePath}`);
    }
    
    return true;
  }

  /**
   * 创建测试CSV文件
   */
  static createTestFile(fileName, data) {
    const filePath = path.join(appConfig.sourcesDir, fileName);
    
    // 确保目录存在
    if (!fs.existsSync(appConfig.sourcesDir)) {
      fs.mkdirSync(appConfig.sourcesDir, { recursive: true });
    }
    
    // 创建CSV内容
    const csvContent = [
      'name,url,username,password,note',
      ...data.map(row => `${row.name},${row.url},${row.username},${row.password},${row.note || ''}`)
    ].join('\n');
    
    fs.writeFileSync(filePath, csvContent, 'utf8');
    console.log(`✅ 测试文件已创建: ${filePath}`);
    
    return filePath;
  }
}

module.exports = FileHandler;
