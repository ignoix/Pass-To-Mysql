const FileHandler = require('../src/utils/fileHandler');

/**
 * 创建测试数据
 */
function createTestData() {
  console.log('🧪 创建测试数据...\n');
  
  // Chrome测试数据
  const chromeData = [
    { name: 'accounts.google.com', url: 'https://accounts.google.com/', username: 'test@gmail.com', password: '123456', note: 'Google账户' },
    { name: 'accounts.microsoft.com', url: 'https://accounts.microsoft.com/', username: 'test@outlook.com', password: 'microsoft123', note: 'Microsoft账户' },
    { name: 'github.com', url: 'https://github.com/', username: 'developer@example.com', password: 'githubpass456', note: '开发账户' }
  ];
  
  // Firefox测试数据
  const firefoxData = [
    { name: 'stackoverflow.com', url: 'https://stackoverflow.com/', username: 'coder@example.com', password: 'stackpass789', note: '编程问答' },
    { name: 'amazon.com', url: 'https://amazon.com/', username: 'shopper@example.com', password: 'amazon123', note: '购物账户' },
    { name: 'facebook.com', url: 'https://facebook.com/', username: 'user@example.com', password: 'fbpass456', note: '社交账户' }
  ];
  
  // Edge测试数据
  const edgeData = [
    { name: 'linkedin.com', url: 'https://linkedin.com/', username: 'professional@example.com', password: 'linkedin789', note: '职业网络' },
    { name: 'twitter.com', url: 'https://twitter.com/', username: 'social@example.com', password: 'twitter123', note: '社交媒体' },
    { name: 'dropbox.com', url: 'https://dropbox.com/', username: 'storage@example.com', password: 'dropbox456', note: '云存储' }
  ];
  
  // 创建测试文件
  FileHandler.createTestFile('Chrome.csv', chromeData);
  FileHandler.createTestFile('Firefox.csv', firefoxData);
  FileHandler.createTestFile('Edge.csv', edgeData);
  
  console.log('\n🎉 测试数据创建完成！');
  console.log('📁 测试文件位置: ./sources/');
  console.log('   - Chrome.csv (3条记录)');
  console.log('   - Firefox.csv (3条记录)');
  console.log('   - Edge.csv (3条记录)');
}

// 如果直接运行此文件
if (require.main === module) {
  createTestData();
}

module.exports = createTestData;
