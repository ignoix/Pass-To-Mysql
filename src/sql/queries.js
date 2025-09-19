/**
 * 密码查询SQL语句
 */
const QUERIES = {
  /**
   * 查找现有记录
   */
  FIND_EXISTING: `
    SELECT id, password 
    FROM pass 
    WHERE name = ? AND url = ? AND username = ? AND \`from\` = ?
  `,

  /**
   * 比较密码
   */
  COMPARE_PASSWORD: `
    SELECT password 
    FROM pass 
    WHERE id = ?
  `,

  /**
   * 插入新记录
   */
  INSERT_RECORD: `
    INSERT INTO pass (name, url, username, password, note, \`from\`) 
    VALUES (?, ?, ?, ?, ?, ?)
  `,

  /**
   * 更新记录
   */
  UPDATE_RECORD: `
    UPDATE pass 
    SET password = ?, note = ?, updated_at = CURRENT_TIMESTAMP 
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
      password,
      note,
      \`from\`,
      created_at,
      updated_at
    FROM pass 
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
      password,
      note,
      \`from\`,
      created_at,
      updated_at
    FROM pass 
    WHERE name LIKE ? OR username LIKE ? OR url LIKE ? OR \`from\` LIKE ?
    ORDER BY \`from\`, name
  `,

  /**
   * 统计总记录数
   */
  COUNT_TOTAL: `SELECT COUNT(*) as total FROM pass`,

  /**
   * 按来源统计
   */
  STATS_BY_SOURCE: `
    SELECT 
      \`from\` as source,
      COUNT(*) as count
    FROM pass 
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
    FROM pass 
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
    FROM pass 
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
    FROM pass 
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
      password
    FROM pass 
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
      password,
      note,
      \`from\`,
      created_at,
      updated_at
    FROM pass 
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
      password,
      LENGTH(password) as password_length
    FROM pass 
    WHERE LENGTH(password) < ?
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
      password
    FROM pass 
    WHERE password REGEXP '[0-9]'
      AND password REGEXP '[!@#$%^&*()_+=\\[\\]{}|;:,.<>?]'
  `,

  /**
   * 验证加密密钥
   */
  VALIDATE_ENCRYPTION_KEY: `
    SELECT 
      name,
      password
    FROM pass 
    LIMIT 1
  `,

  /**
   * 根据ID查询单条记录
   */
  SELECT_PASSWORD_BY_ID: `
    SELECT 
      id,
      name,
      url,
      username,
      password,
      note,
      \`from\`,
      created_at,
      updated_at
    FROM pass 
    WHERE id = ?
  `,

  /**
   * 分页查询所有密码
   */
  SELECT_ALL_PASSWORDS_WITH_PAGINATION: `
    SELECT 
      id,
      name,
      url,
      username,
      password,
      note,
      \`from\`,
      created_at,
      updated_at
    FROM pass 
    ORDER BY \`from\`, name
    LIMIT ? OFFSET ?
  `,

  /**
   * 分页搜索密码
   */
  SEARCH_PASSWORDS_WITH_PAGINATION: `
    SELECT 
      id,
      name,
      url,
      username,
      password,
      note,
      \`from\`,
      created_at,
      updated_at
    FROM pass 
    WHERE name LIKE ? OR username LIKE ? OR url LIKE ? OR \`from\` LIKE ?
    ORDER BY \`from\`, name
    LIMIT ? OFFSET ?
  `,

  /**
   * 统计搜索结果数量
   */
  COUNT_SEARCH_RESULTS: `
    SELECT COUNT(*) as total 
    FROM pass 
    WHERE name LIKE ? OR username LIKE ? OR url LIKE ? OR \`from\` LIKE ?
  `,

  /**
   * 根据ID查找记录
   */
  FIND_BY_ID: `
    SELECT id, name, url, username, note, \`from\`, created_at, updated_at
    FROM pass 
    WHERE id = ?
  `,

  /**
   * 根据ID更新记录
   */
  UPDATE_RECORD_BY_ID: `
    UPDATE pass 
    SET name = ?, url = ?, username = ?, password = ?, 
        note = ?, \`from\` = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `,

  /**
   * 根据ID删除记录
   */
  DELETE_RECORD_BY_ID: `
    DELETE FROM pass WHERE id = ?
  `
};

module.exports = QUERIES;
