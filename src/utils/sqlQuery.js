const Database = require('./database');
const { QUERIES } = require('../sql');
const { cryptoKey } = require('../config/database');

/**
 * SQL查询工具类
 * 提供高级查询功能
 */
class SqlQuery {
  constructor() {
    this.db = new Database();
  }

  /**
   * 查找重复网站
   */
  async findDuplicateSites() {
    const connection = await this.db.connect();
    const [rows] = await connection.query(QUERIES.FIND_DUPLICATE_SITES);
    return rows;
  }

  /**
   * 查找空备注记录
   */
  async findEmptyNotes() {
    const connection = await this.db.connect();
    const [rows] = await connection.query(QUERIES.FIND_EMPTY_NOTES);
    return rows;
  }

  /**
   * 查找最近添加的记录
   */
  async findRecentRecords(limit = 10) {
    const connection = await this.db.connect();
    const [rows] = await connection.query(QUERIES.FIND_RECENT_RECORDS, [limit]);
    return rows;
  }

  /**
   * 查找特定长度密码
   */
  async findPasswordsByLength(maxLength = 8) {
    const connection = await this.db.connect();
    const [rows] = await connection.query(QUERIES.FIND_PASSWORDS_BY_LENGTH, [maxLength]);
    return rows;
  }

  /**
   * 查找包含特殊字符的密码
   */
  async findPasswordsWithSpecialChars() {
    const connection = await this.db.connect();
    const [rows] = await connection.query(QUERIES.FIND_PASSWORDS_WITH_SPECIAL_CHARS);
    return rows;
  }

  /**
   * 按邮箱域名统计
   */
  async getStatsByEmailDomain() {
    const connection = await this.db.connect();
    const [rows] = await connection.query(QUERIES.STATS_BY_EMAIL_DOMAIN);
    return rows;
  }

  /**
   * 验证加密密钥
   */
  async validateEncryptionKey() {
    const connection = await this.db.connect();
    const [rows] = await connection.query(QUERIES.VALIDATE_ENCRYPTION_KEY);
    return rows.length > 0 && rows[0].password !== null;
  }

  /**
   * 执行自定义查询
   */
  async executeCustomQuery(query, params = []) {
    const connection = await this.db.connect();
    const [rows] = await connection.query(query, params);
    return rows;
  }

  /**
   * 关闭连接
   */
  async close() {
    await this.db.close();
  }
}

module.exports = SqlQuery;
