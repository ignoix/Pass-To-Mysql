const PasswordService = require('./services/passwordService');
const FileHandler = require('./utils/fileHandler');

/**
 * 主程序入口
 */
class PasswordManager {
  constructor() {
    this.service = new PasswordService();
  }

  /**
   * 导入单个文件
   */
  async importFile(filePath) {
    try {
      const result = await this.service.importFile(filePath);
      console.log(`\n🎉 导入完成!`);
      console.log(`   📁 文件: ${result.fileName}`);
      console.log(`   ✅ 新增: ${result.insertedCount} 条`);
      console.log(`   🔄 更新: ${result.updatedCount} 条`);
      console.log(`   ⏭️  跳过: ${result.skippedCount} 条`);
    } catch (error) {
      console.error('❌ 导入失败:', error.message);
      process.exit(1);
    } finally {
      await this.service.close();
    }
  }

  /**
   * 批量导入所有文件
   */
  async importAll() {
    try {
      await this.service.importMultipleFiles();
    } catch (error) {
      console.error('❌ 批量导入失败:', error.message);
      process.exit(1);
    } finally {
      await this.service.close();
    }
  }

  /**
   * 查询密码
   */
  async query(searchTerm = '') {
    try {
      await this.service.queryPasswords(searchTerm);
    } catch (error) {
      console.error('❌ 查询失败:', error.message);
      process.exit(1);
    } finally {
      await this.service.close();
    }
  }

  /**
   * 显示统计信息
   */
  async stats() {
    try {
      await this.service.getStats();
    } catch (error) {
      console.error('❌ 统计失败:', error.message);
      process.exit(1);
    } finally {
      await this.service.close();
    }
  }

  /**
   * 创建测试数据
   */
  createTestData() {
    const createTestData = require('../tests/createTestData');
    createTestData();
  }
}

module.exports = PasswordManager;
