#!/usr/bin/env node

const PasswordManager = require('./src/index');
const SqlQuery = require('./src/utils/sqlQuery');
const path = require('path');

/**
 * 命令行接口
 */
class CLI {
  constructor() {
    this.manager = new PasswordManager();
    this.sqlQuery = new SqlQuery();
  }

  /**
   * 显示帮助信息
   */
  showHelp() {
    console.log(`
🔐 密码管理系统 CLI

使用方法:
  node cli.js <命令> [参数]

命令:
  import [文件路径]     导入指定文件（不指定则导入所有文件）
  query [搜索词]       查询密码（不指定则显示所有）
  stats               显示统计信息
  duplicates           查找重复网站
  empty-notes         查找空备注记录
  recent [数量]       查找最近添加的记录
  weak-passwords      查找弱密码
  email-stats         按邮箱域名统计
  validate-key        验证加密密钥
  test                创建测试数据
  help                显示此帮助信息

示例:
  node cli.js import                    # 导入所有CSV文件
  node cli.js import sources/Chrome.csv # 导入指定文件
  node cli.js query google              # 搜索包含"google"的密码
  node cli.js query all                 # 显示所有密码
  node cli.js stats                     # 显示统计信息
  node cli.js duplicates                # 查找重复网站
  node cli.js recent 5                  # 查找最近5条记录
  node cli.js weak-passwords            # 查找弱密码
  node cli.js test                      # 创建测试数据
    `);
  }

  /**
   * 运行命令
   */
  async run() {
    const args = process.argv.slice(2);
    const command = args[0];
    const param = args[1];

    switch (command) {
      case 'import':
        if (param) {
          // 导入指定文件
          const filePath = path.resolve(param);
          await this.manager.importFile(filePath);
        } else {
          // 导入所有文件
          await this.manager.importAll();
        }
        break;

      case 'query':
        if (param === 'all') {
          await this.manager.query();
        } else {
          await this.manager.query(param || '');
        }
        break;

      case 'stats':
        await this.manager.stats();
        break;

      case 'duplicates':
        await this.showDuplicates();
        break;

      case 'empty-notes':
        await this.showEmptyNotes();
        break;

      case 'recent':
        const limit = parseInt(param) || 10;
        await this.showRecent(limit);
        break;

      case 'weak-passwords':
        await this.showWeakPasswords();
        break;

      case 'email-stats':
        await this.showEmailStats();
        break;

      case 'validate-key':
        await this.validateKey();
        break;

      case 'test':
        this.manager.createTestData();
        break;

      case 'help':
      case '--help':
      case '-h':
        this.showHelp();
        break;

      default:
        console.log('❌ 未知命令:', command);
        this.showHelp();
        process.exit(1);
    }
  }

  /**
   * 显示重复网站
   */
  async showDuplicates() {
    try {
      const duplicates = await this.sqlQuery.findDuplicateSites();
      
      if (duplicates.length === 0) {
        console.log('✅ 没有发现重复网站');
        return;
      }
      
      console.log(`\n🔍 发现 ${duplicates.length} 个重复网站:\n`);
      console.table(duplicates);
      
    } catch (error) {
      console.error('❌ 查询重复网站失败:', error.message);
    } finally {
      await this.sqlQuery.close();
    }
  }

  /**
   * 显示空备注记录
   */
  async showEmptyNotes() {
    try {
      const emptyNotes = await this.sqlQuery.findEmptyNotes();
      
      if (emptyNotes.length === 0) {
        console.log('✅ 所有记录都有备注');
        return;
      }
      
      console.log(`\n📝 发现 ${emptyNotes.length} 条空备注记录:\n`);
      console.table(emptyNotes);
      
    } catch (error) {
      console.error('❌ 查询空备注失败:', error.message);
    } finally {
      await this.sqlQuery.close();
    }
  }

  /**
   * 显示最近记录
   */
  async showRecent(limit) {
    try {
      const recent = await this.sqlQuery.findRecentRecords(limit);
      
      if (recent.length === 0) {
        console.log('❌ 没有找到记录');
        return;
      }
      
      console.log(`\n🕒 最近 ${recent.length} 条记录:\n`);
      console.table(recent);
      
    } catch (error) {
      console.error('❌ 查询最近记录失败:', error.message);
    } finally {
      await this.sqlQuery.close();
    }
  }

  /**
   * 显示弱密码
   */
  async showWeakPasswords() {
    try {
      const weakPasswords = await this.sqlQuery.findPasswordsByLength(8);
      
      if (weakPasswords.length === 0) {
        console.log('✅ 没有发现弱密码（长度小于8位）');
        return;
      }
      
      console.log(`\n⚠️  发现 ${weakPasswords.length} 个弱密码:\n`);
      console.table(weakPasswords);
      
    } catch (error) {
      console.error('❌ 查询弱密码失败:', error.message);
    } finally {
      await this.sqlQuery.close();
    }
  }

  /**
   * 显示邮箱统计
   */
  async showEmailStats() {
    try {
      const emailStats = await this.sqlQuery.getStatsByEmailDomain();
      
      if (emailStats.length === 0) {
        console.log('❌ 没有找到邮箱记录');
        return;
      }
      
      console.log('\n📧 按邮箱域名统计:\n');
      console.table(emailStats);
      
    } catch (error) {
      console.error('❌ 查询邮箱统计失败:', error.message);
    } finally {
      await this.sqlQuery.close();
    }
  }

  /**
   * 验证加密密钥
   */
  async validateKey() {
    try {
      const isValid = await this.sqlQuery.validateEncryptionKey();
      
      if (isValid) {
        console.log('✅ 加密密钥验证成功');
      } else {
        console.log('❌ 加密密钥验证失败');
      }
      
    } catch (error) {
      console.error('❌ 验证密钥失败:', error.message);
    } finally {
      await this.sqlQuery.close();
    }
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const cli = new CLI();
  cli.run().catch(console.error);
}

module.exports = CLI;
