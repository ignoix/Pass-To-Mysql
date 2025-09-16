const mysql = require('mysql2/promise');
const { dbConfig, encryptionConfig, appConfig } = require('../config/database');
const { SCHEMA, QUERIES } = require('../sql');

/**
 * 数据库连接工具类
 */
class Database {
  constructor() {
    this.connection = null;
  }

  /**
   * 创建数据库连接
   */
  async connect() {
    if (this.connection) {
      return this.connection;
    }

    // 先连接到MySQL服务器（不指定数据库）
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    // 创建数据库（如果不存在）
    await tempConnection.query(SCHEMA.CREATE_DATABASE(dbConfig.database));
    await tempConnection.end();
    
    // 连接到指定数据库
    this.connection = await mysql.createConnection(dbConfig);
    return this.connection;
  }

  /**
   * 确保表存在
   */
  async ensureTable() {
    const connection = await this.connect();
    await connection.query(SCHEMA.CREATE_TABLE);
  }

  /**
   * 检查记录是否存在
   */
  async findExisting(name, url, username, from) {
    const connection = await this.connect();
    const [rows] = await connection.query(QUERIES.FIND_EXISTING, [name, url, username, from]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * 比较密码是否相同
   */
  async comparePassword(existingId, password) {
    const connection = await this.connect();
    const [rows] = await connection.query(QUERIES.COMPARE_PASSWORD, [encryptionConfig.key, existingId]);
    
    if (rows[0] && rows[0].decrypted_password) {
      return rows[0].decrypted_password.toString() === password;
    }
    return false;
  }

  /**
   * 插入新记录
   */
  async insert(name, url, username, password, note, from) {
    const connection = await this.connect();
    await connection.query(QUERIES.INSERT_RECORD, [name, url, username, password, encryptionConfig.key, note, from]);
  }

  /**
   * 更新记录
   */
  async update(existingId, password, note) {
    const connection = await this.connect();
    await connection.query(QUERIES.UPDATE_RECORD, [password, encryptionConfig.key, note, existingId]);
  }

  /**
   * 查询密码（解密）
   */
  async queryPasswords(searchTerm = '') {
    const connection = await this.connect();
    
    let query, params;
    
    if (searchTerm) {
      query = QUERIES.SEARCH_PASSWORDS;
      params = [encryptionConfig.key, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
    } else {
      query = QUERIES.SELECT_ALL_PASSWORDS;
      params = [encryptionConfig.key];
    }
    
    const [rows] = await connection.query(query, params);
    return rows;
  }

  /**
   * 获取统计信息
   */
  async getStats() {
    const connection = await this.connect();
    
    // 总记录数
    const [countResult] = await connection.query(QUERIES.COUNT_TOTAL);
    
    // 按来源文件统计
    const [sourceResult] = await connection.query(QUERIES.STATS_BY_SOURCE);
    
    // 按网站类型统计
    const [groupResult] = await connection.query(QUERIES.STATS_BY_CATEGORY);
    
    return {
      total: countResult[0].total,
      bySource: sourceResult,
      byCategory: groupResult
    };
  }

  /**
   * 关闭连接
   */
  async close() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }
}

module.exports = Database;
