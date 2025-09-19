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
   * 导入密码文件（Web API用）
   */
  async importPasswords(filePath, source = 'Chrome') {
    try {
      const result = await this.service.importFile(filePath, source);
      return {
        inserted: result.insertedCount,
        updated: result.updatedCount,
        skipped: result.skippedCount,
        fileName: result.fileName
      };
    } catch (error) {
      console.error('❌ 导入失败:', error.message);
      throw error;
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
  async query(searchTerm = '', page = 1, limit = 20, id = null) {
    try {
      const result = await this.service.queryPasswords(searchTerm, page, limit, id);
      return result;
    } catch (error) {
      console.error('❌ 查询失败:', error.message);
      throw error;
    }
  }

  /**
   * 显示统计信息
   */
  async stats() {
    try {
      const result = await this.service.getStats();
      return result;
    } catch (error) {
      console.error('❌ 统计失败:', error.message);
      throw error;
    }
  }

  /**
   * 添加密码
   */
  async addPassword(passwordData) {
    try {
      const result = await this.service.addPassword(passwordData);
      return result;
    } catch (error) {
      console.error('❌ 添加密码失败:', error.message);
      throw error;
    }
  }

  /**
   * 更新密码
   */
  async updatePassword(id, passwordData) {
    try {
      const result = await this.service.updatePassword(id, passwordData);
      return result;
    } catch (error) {
      console.error('❌ 更新密码失败:', error.message);
      throw error;
    }
  }

  /**
   * 删除密码
   */
  async deletePassword(id) {
    try {
      const result = await this.service.deletePassword(id);
      return result;
    } catch (error) {
      console.error('❌ 删除密码失败:', error.message);
      throw error;
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
