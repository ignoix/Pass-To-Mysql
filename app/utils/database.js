const mysql = require('mysql2/promise');
const { dbConfig, cryptoKey, appConfig } = require('../config/database');
const { SCHEMA, QUERIES } = require('../sql');
const Crypto = require('./crypto');

/**
 * 数据库连接工具类
 */
class Database {
  constructor() {
    this.connection = null;
    this.crypto = new Crypto(cryptoKey);
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
    const [rows] = await connection.query(QUERIES.COMPARE_PASSWORD, [existingId]);
    
    if (rows[0] && rows[0].password) {
      const decryptedPassword = this.crypto.decrypt(rows[0].password);
      return decryptedPassword === password;
    }
    return false;
  }

  /**
   * 插入新记录
   */
  async insert(name, url, username, password, note, from) {
    const connection = await this.connect();
    const encryptedPassword = this.crypto.encrypt(password);
    await connection.query(QUERIES.INSERT_RECORD, [name, url, username, encryptedPassword, note, from]);
  }

  /**
   * 更新记录
   */
  async update(existingId, password, note) {
    const connection = await this.connect();
    const encryptedPassword = this.crypto.encrypt(password);
    await connection.query(QUERIES.UPDATE_RECORD, [encryptedPassword, note, existingId]);
  }

  /**
   * 查询密码（解密）
   */
  async queryPasswords(searchTerm = '', page = 1, limit = 20, id = null) {
    const connection = await this.connect();
    
    let query, params;
    
    if (id) {
      // 根据ID查询单条记录
      query = QUERIES.SELECT_PASSWORD_BY_ID;
      params = [id];
    } else if (searchTerm) {
      // 搜索查询
      query = QUERIES.SEARCH_PASSWORDS_WITH_PAGINATION;
      const offset = (page - 1) * limit;
      params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, limit, offset];
    } else {
      // 分页查询所有记录
      query = QUERIES.SELECT_ALL_PASSWORDS_WITH_PAGINATION;
      const offset = (page - 1) * limit;
      params = [limit, offset];
    }
    
    const [rows] = await connection.query(query, params);
    
    // 返回密文，不解密
    return rows;
  }

  /**
   * 获取总记录数
   */
  async getTotalCount(searchTerm = '') {
    const connection = await this.connect();
    
    let query, params;
    
    if (searchTerm) {
      query = QUERIES.COUNT_SEARCH_RESULTS;
      params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
    } else {
      query = QUERIES.COUNT_TOTAL;
      params = [];
    }
    
    const [rows] = await connection.query(query, params);
    return rows[0].total;
  }

  /**
   * 根据ID查找记录
   */
  async findById(id) {
    const connection = await this.connect();
    const [rows] = await connection.query(QUERIES.FIND_BY_ID, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * 根据ID更新记录
   */
  async updateById(id, name, url, username, password, note, from) {
    const connection = await this.connect();
    const encryptedPassword = this.crypto.encrypt(password);
    await connection.query(QUERIES.UPDATE_RECORD_BY_ID, [name, url, username, encryptedPassword, note, from, id]);
    return { id, name, url, username, note, from };
  }

  /**
   * 根据ID删除记录
   */
  async deleteById(id) {
    const connection = await this.connect();
    await connection.query(QUERIES.DELETE_RECORD_BY_ID, [id]);
    return { id };
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
