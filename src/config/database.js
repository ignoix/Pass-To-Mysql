require('dotenv').config();

/**
 * 数据库配置
 */
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'local_pass'
};

/**
 * 加密配置
 */
const encryptionConfig = {
  key: process.env.ENCRYPTION_KEY || 'mySecretKey123456789012345678901234567890'
};

/**
 * 应用配置
 */
const appConfig = {
  sourcesDir: process.env.SOURCES_DIR || './sources',
  maxKeyLength: 3072, // MySQL索引最大长度
  uniqueKeyPrefixes: {
    name: 100,
    url: 200,
    username: 100,
    from: 50
  }
};

module.exports = {
  dbConfig,
  encryptionConfig,
  appConfig
};
