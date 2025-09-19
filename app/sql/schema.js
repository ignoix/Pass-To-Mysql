/**
 * 数据库表结构SQL语句
 */
const { appConfig } = require('../config/database');

const SCHEMA = {
  /**
   * 创建pass表
   */
  CREATE_TABLE: `
    CREATE TABLE IF NOT EXISTS pass (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      url VARCHAR(500),
      username VARCHAR(255),
      password TEXT,
      note TEXT,
      \`from\` VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_password (
        name(${appConfig.uniqueKeyPrefixes.name}), 
        url(${appConfig.uniqueKeyPrefixes.url}), 
        username(${appConfig.uniqueKeyPrefixes.username}), 
        \`from\`(${appConfig.uniqueKeyPrefixes.from})
      )
    )
  `,

  /**
   * 创建数据库
   */
  CREATE_DATABASE: (databaseName) => `CREATE DATABASE IF NOT EXISTS ${databaseName}`,

  /**
   * 检查表是否存在
   */
  CHECK_TABLE_EXISTS: `SHOW TABLES LIKE "pass"`,

  /**
   * 检查字段是否存在
   */
  CHECK_COLUMN_EXISTS: `SHOW COLUMNS FROM pass LIKE "from"`,

  /**
   * 添加from字段
   */
  ADD_FROM_COLUMN: `ALTER TABLE pass ADD COLUMN \`from\` VARCHAR(255) NOT NULL DEFAULT "Chrome" AFTER note`,

  /**
   * 添加updated_at字段
   */
  ADD_UPDATED_AT_COLUMN: `ALTER TABLE pass ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at`,

  /**
   * 删除旧索引
   */
  DROP_OLD_INDEX: `ALTER TABLE pass DROP INDEX unique_password`,

  /**
   * 添加新索引
   */
  ADD_NEW_INDEX: `ALTER TABLE pass ADD UNIQUE KEY unique_password (name(${appConfig.uniqueKeyPrefixes.name}), url(${appConfig.uniqueKeyPrefixes.url}), username(${appConfig.uniqueKeyPrefixes.username}), \`from\`(${appConfig.uniqueKeyPrefixes.from}))`,

  /**
   * 查看表结构
   */
  DESCRIBE_TABLE: `DESCRIBE pass`
};

module.exports = SCHEMA;
