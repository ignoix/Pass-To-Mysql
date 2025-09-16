/**
 * 密码查询SQL语句
 */
const QUERIES = {
  /**
   * 查找现有记录
   */
  FIND_EXISTING: `
    SELECT id, password_encrypted 
    FROM passwords 
    WHERE name = ? AND url = ? AND username = ? AND \`from\` = ?
  `,

  /**
   * 比较密码
   */
  COMPARE_PASSWORD: `
    SELECT AES_DECRYPT(password_encrypted, ?) as decrypted_password 
    FROM passwords 
    WHERE id = ?
  `,

  /**
   * 插入新记录
   */
  INSERT_RECORD: `
    INSERT INTO passwords (name, url, username, password_encrypted, note, \`from\`) 
    VALUES (?, ?, ?, AES_ENCRYPT(?, ?), ?, ?)
  `,

  /**
   * 更新记录
   */
  UPDATE_RECORD: `
    UPDATE passwords 
    SET password_encrypted = AES_ENCRYPT(?, ?), note = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `,

  /**
   * 查询所有密码（解密）
   */
  SELECT_ALL_PASSWORDS: `
    SELECT 
      id,
      name,
      url,
      username,
      CAST(AES_DECRYPT(password_encrypted, ?) AS CHAR) as password,
      note,
      \`from\`,
      created_at,
      updated_at
    FROM passwords 
    ORDER BY \`from\`, name
  `,

  /**
   * 搜索密码（解密）
   */
  SEARCH_PASSWORDS: `
    SELECT 
      id,
      name,
      url,
      username,
      CAST(AES_DECRYPT(password_encrypted, ?) AS CHAR) as password,
      note,
      \`from\`,
      created_at,
      updated_at
    FROM passwords 
    WHERE name LIKE ? OR username LIKE ? OR url LIKE ? OR \`from\` LIKE ?
    ORDER BY \`from\`, name
  `,

  /**
   * 统计总记录数
   */
  COUNT_TOTAL: `SELECT COUNT(*) as total FROM passwords`,

  /**
   * 按来源统计
   */
  STATS_BY_SOURCE: `
    SELECT 
      \`from\` as source,
      COUNT(*) as count
    FROM passwords 
    GROUP BY \`from\`
    ORDER BY count DESC
  `,

  /**
   * 按网站类型统计
   */
  STATS_BY_CATEGORY: `
    SELECT 
      CASE 
        WHEN name LIKE '%google%' THEN 'Google'
        WHEN name LIKE '%facebook%' THEN 'Facebook'
        WHEN name LIKE '%amazon%' THEN 'Amazon'
        WHEN name LIKE '%microsoft%' THEN 'Microsoft'
        WHEN name LIKE '%github%' THEN 'GitHub'
        WHEN name LIKE '%apple%' THEN 'Apple'
        WHEN name LIKE '%twitter%' OR name LIKE '%x.com%' THEN 'Twitter/X'
        WHEN name LIKE '%linkedin%' THEN 'LinkedIn'
        WHEN name LIKE '%stackoverflow%' THEN 'StackOverflow'
        WHEN name LIKE '%dropbox%' THEN 'Dropbox'
        ELSE '其他'
      END as category,
      COUNT(*) as count
    FROM passwords 
    GROUP BY category
    ORDER BY count DESC
  `,

  /**
   * 按邮箱域名统计
   */
  STATS_BY_EMAIL_DOMAIN: `
    SELECT 
      SUBSTRING_INDEX(username, '@', -1) as email_domain,
      COUNT(*) as count
    FROM passwords 
    WHERE username LIKE '%@%'
    GROUP BY email_domain
    ORDER BY count DESC
  `,

  /**
   * 查找重复网站
   */
  FIND_DUPLICATE_SITES: `
    SELECT 
      name, 
      COUNT(*) as duplicate_count,
      GROUP_CONCAT(username) as usernames
    FROM passwords 
    GROUP BY name 
    HAVING COUNT(*) > 1
    ORDER BY duplicate_count DESC
  `,

  /**
   * 查找空备注记录
   */
  FIND_EMPTY_NOTES: `
    SELECT 
      id, 
      name, 
      url, 
      username, 
      CAST(AES_DECRYPT(password_encrypted, ?) AS CHAR) as password
    FROM passwords 
    WHERE note IS NULL OR note = ''
  `,

  /**
   * 查找最近添加的记录
   */
  FIND_RECENT_RECORDS: `
    SELECT 
      id, 
      name, 
      url, 
      username, 
      CAST(AES_DECRYPT(password_encrypted, ?) AS CHAR) as password,
      note,
      \`from\`,
      created_at,
      updated_at
    FROM passwords 
    ORDER BY created_at DESC 
    LIMIT ?
  `,

  /**
   * 查找特定长度密码
   */
  FIND_PASSWORDS_BY_LENGTH: `
    SELECT 
      id, 
      name, 
      url, 
      username, 
      CAST(AES_DECRYPT(password_encrypted, ?) AS CHAR) as password,
      LENGTH(CAST(AES_DECRYPT(password_encrypted, ?) AS CHAR)) as password_length
    FROM passwords 
    WHERE LENGTH(CAST(AES_DECRYPT(password_encrypted, ?) AS CHAR)) < ?
  `,

  /**
   * 查找包含特殊字符的密码
   */
  FIND_PASSWORDS_WITH_SPECIAL_CHARS: `
    SELECT 
      id, 
      name, 
      url, 
      username, 
      CAST(AES_DECRYPT(password_encrypted, ?) AS CHAR) as password
    FROM passwords 
    WHERE CAST(AES_DECRYPT(password_encrypted, ?) AS CHAR) REGEXP '[0-9]'
      AND CAST(AES_DECRYPT(password_encrypted, ?) AS CHAR) REGEXP '[!@#$%^&*()_+=\\[\\]{}|;:,.<>?]'
  `,

  /**
   * 验证加密密钥
   */
  VALIDATE_ENCRYPTION_KEY: `
    SELECT 
      name,
      CAST(AES_DECRYPT(password_encrypted, ?) AS CHAR) as password
    FROM passwords 
    LIMIT 1
  `
};

module.exports = QUERIES;
