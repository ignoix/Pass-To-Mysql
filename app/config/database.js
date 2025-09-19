require('dotenv').config();

/**
 * 数据库配置
 */
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'pass_manager'
};

/**
 * 加密密钥（用于crypto-js）
 */
const cryptoKey = process.env.CRYPTO_KEY || 'mySecretKey123456789012345678901234567890';

/**
 * 应用配置
 */
const appConfig = {
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB
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
  cryptoKey,
  appConfig
};
