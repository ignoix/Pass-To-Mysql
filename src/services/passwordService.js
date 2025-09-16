const Database = require('../utils/database');
const FileHandler = require('../utils/fileHandler');

/**
 * 密码导入服务
 */
class PasswordService {
  constructor() {
    this.db = new Database();
  }

  /**
   * 导入单个文件
   */
  async importFile(filePath) {
    try {
      // 验证文件
      FileHandler.validateCsvFile(filePath);
      
      // 确保数据库表存在
      await this.db.ensureTable();
      
      // 解析CSV文件
      const rows = await FileHandler.parseCsvFile(filePath);
      const fileName = FileHandler.getFileName(filePath);
      
      console.log(`📁 正在处理文件: ${fileName}`);
      
      let insertedCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      
      for (const row of rows) {
        const { name, url, username, password, note, from } = row;
        
        // 检查记录是否已存在
        const existing = await this.db.findExisting(name, url, username, from);
        
        if (existing) {
          // 记录已存在，检查密码是否相同
          const isSamePassword = await this.db.comparePassword(existing.id, password);
          
          if (isSamePassword) {
            // 密码相同，跳过
            skippedCount++;
            continue;
          } else {
            // 密码不同，更新记录
            await this.db.update(existing.id, password, note);
            updatedCount++;
          }
        } else {
          // 记录不存在，插入新记录
          await this.db.insert(name, url, username, password, note, from);
          insertedCount++;
        }
      }
      
      console.log(`   ✅ 新增: ${insertedCount} 条`);
      console.log(`   🔄 更新: ${updatedCount} 条`);
      console.log(`   ⏭️  跳过: ${skippedCount} 条`);
      
      return { insertedCount, updatedCount, skippedCount, fileName };
      
    } catch (error) {
      console.error(`❌ 处理文件失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 批量导入多个文件
   */
  async importMultipleFiles() {
    const csvFiles = FileHandler.getCsvFiles();
    
    if (csvFiles.length === 0) {
      console.log('❌ 未找到CSV文件');
      return;
    }
    
    console.log(`🔍 找到 ${csvFiles.length} 个CSV文件:`);
    csvFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${FileHandler.getFileName(file)}`);
    });
    
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    
    for (const filePath of csvFiles) {
      try {
        const result = await this.importFile(filePath);
        totalInserted += result.insertedCount;
        totalUpdated += result.updatedCount;
        totalSkipped += result.skippedCount;
      } catch (err) {
        console.error(`❌ 处理文件 ${FileHandler.getFileName(filePath)} 失败:`, err.message);
      }
    }
    
    console.log(`\n🎉 批量导入完成!`);
    console.log(`   📊 总计统计:`);
    console.log(`   ✅ 新增记录: ${totalInserted} 条`);
    console.log(`   🔄 更新记录: ${totalUpdated} 条`);
    console.log(`   ⏭️  跳过记录: ${totalSkipped} 条`);
    console.log(`   🔒 所有密码已加密存储`);
    
    return { totalInserted, totalUpdated, totalSkipped };
  }

  /**
   * 查询密码
   */
  async queryPasswords(searchTerm = '') {
    try {
      const rows = await this.db.queryPasswords(searchTerm);
      
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
        console.log(`   来源: ${row.from}`);
        if (row.note) {
          console.log(`   备注: ${row.note}`);
        }
        console.log(`   创建时间: ${row.created_at}`);
        if (row.updated_at && row.updated_at !== row.created_at) {
          console.log(`   更新时间: ${row.updated_at}`);
        }
        console.log('-'.repeat(80));
      });
      
    } catch (error) {
      console.error('查询失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取统计信息
   */
  async getStats() {
    try {
      const stats = await this.db.getStats();
      
      console.log(`\n数据库中共有 ${stats.total} 条密码记录\n`);
      
      console.log('按来源文件分组的统计：');
      console.table(stats.bySource);
      
      console.log('\n按网站类型分组的统计：');
      console.table(stats.byCategory);
      
      return stats;
      
    } catch (error) {
      console.error('统计失败:', error.message);
      throw error;
    }
  }

  /**
   * 关闭数据库连接
   */
  async close() {
    await this.db.close();
  }
}

module.exports = PasswordService;
