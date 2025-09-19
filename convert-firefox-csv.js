const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

/**
 * Firefox CSV 转换器
 * 将Firefox导出的CSV文件转换为项目可用的格式
 */

class FirefoxCsvConverter {
    constructor() {
        this.inputFile = 'passwords.csv';
        this.outputFile = 'converted-passwords.csv';
    }

    /**
     * 从URL提取网站名称
     */
    extractSiteName(url) {
        try {
            const urlObj = new URL(url);
            let hostname = urlObj.hostname;
            
            // 移除 www. 前缀
            if (hostname.startsWith('www.')) {
                hostname = hostname.substring(4);
            }
            
            // 如果是子域名，取主域名
            const parts = hostname.split('.');
            if (parts.length > 2) {
                // 保留最后两部分（如 google.com）
                hostname = parts.slice(-2).join('.');
            }
            
            return hostname;
        } catch (error) {
            // 如果URL解析失败，返回原始URL
            return url;
        }
    }

    /**
     * 转换单条记录
     */
    convertRecord(record) {
        const siteName = this.extractSiteName(record.url);
        
        return {
            name: siteName,
            url: record.url,
            username: record.username,
            password: record.password,
            note: `Firefox导入 - 创建时间: ${new Date(parseInt(record.timeCreated)).toLocaleString()}`
        };
    }

    /**
     * 执行转换
     */
    async convert() {
        console.log('🔄 开始转换Firefox CSV文件...');
        console.log(`📁 输入文件: ${this.inputFile}`);
        console.log(`📁 输出文件: ${this.outputFile}`);

        if (!fs.existsSync(this.inputFile)) {
            console.error(`❌ 输入文件不存在: ${this.inputFile}`);
            return;
        }

        const results = [];
        let processedCount = 0;
        let errorCount = 0;
        let skippedCount = 0;

        return new Promise((resolve, reject) => {
            fs.createReadStream(this.inputFile)
                .pipe(csv())
                .on('data', (data) => {
                    try {
                        // 跳过空记录
                        if (!data.url || !data.username || !data.password) {
                            skippedCount++;
                            console.log(`⚠️  跳过空记录 ${skippedCount}: ${JSON.stringify(data)}`);
                            return;
                        }

                        const converted = this.convertRecord(data);
                        results.push(converted);
                        processedCount++;
                        
                        // 每10条记录显示一次进度
                        if (processedCount % 10 === 0 || processedCount <= 10) {
                            console.log(`✅ 转换记录 ${processedCount}: ${converted.name} - ${converted.username}`);
                        }
                    } catch (error) {
                        errorCount++;
                        console.error(`❌ 转换记录失败:`, error.message);
                        console.error(`   原始数据:`, JSON.stringify(data));
                    }
                })
                .on('end', () => {
                    this.writeOutputFile(results);
                    console.log('\n📊 转换完成统计:');
                    console.log(`✅ 成功转换: ${processedCount} 条记录`);
                    console.log(`⚠️  跳过空记录: ${skippedCount} 条记录`);
                    console.log(`❌ 转换失败: ${errorCount} 条记录`);
                    console.log(`📁 输出文件: ${this.outputFile}`);
                    
                    if (results.length > 0) {
                        console.log('\n📋 转换后的数据预览（前5条）:');
                        results.slice(0, 5).forEach((record, index) => {
                            console.log(`  ${index + 1}. ${record.name} | ${record.username} | ${record.password.substring(0, 8)}...`);
                        });
                        if (results.length > 5) {
                            console.log(`  ... 还有 ${results.length - 5} 条记录`);
                        }
                    }
                    
                    resolve(results);
                })
                .on('error', (error) => {
                    console.error('❌ 读取文件失败:', error.message);
                    reject(error);
                });
        });
    }

    /**
     * 写入输出文件
     */
    writeOutputFile(results) {
        if (results.length === 0) {
            console.log('⚠️  没有数据可写入');
            return;
        }

        // 创建CSV头部
        const headers = ['name', 'url', 'username', 'password', 'note'];
        
        // 创建CSV内容
        const csvContent = [
            headers.join(','),
            ...results.map(record => 
                headers.map(header => {
                    const value = record[header] || '';
                    // 如果值包含逗号、引号或换行符，需要用引号包围并转义
                    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');

        fs.writeFileSync(this.outputFile, csvContent, 'utf8');
        console.log(`✅ 输出文件已生成: ${this.outputFile}`);
    }

    /**
     * 显示使用说明
     */
    static showUsage() {
        console.log(`
🦊 Firefox CSV 转换器

📖 使用方法:
1. 将Firefox导出的CSV文件重命名为 'passwords.csv' 并放在项目根目录
2. 运行: node convert-firefox-csv.js
3. 转换后的文件将保存为 'converted-passwords.csv'
4. 使用Web界面导入 'converted-passwords.csv' 文件

🦊 Firefox导出步骤:
1. 打开Firefox浏览器
2. 访问 about:logins
3. 点击右上角的三点菜单（⋮）
4. 选择"导出登录信息"
5. 选择"CSV格式"
6. 将导出的文件重命名为 'passwords.csv'
7. 将文件复制到项目根目录

📋 转换后的格式:
- name: 网站名称（从URL提取，如 google.com）
- url: 完整URL（如 https://accounts.google.com）
- username: 用户名
- password: 密码
- note: 备注信息（包含Firefox导入时间）

🔧 高级用法:
- 自定义输入文件: node convert-firefox-csv.js --input=my-passwords.csv
- 自定义输出文件: node convert-firefox-csv.js --output=my-converted.csv
- 查看帮助: node convert-firefox-csv.js --help

📊 转换统计:
- 显示成功转换的记录数
- 显示跳过的空记录数
- 显示转换失败的记录数
- 预览转换后的前5条记录

⚠️  注意事项:
- 确保Firefox CSV文件格式正确
- 空记录（缺少URL、用户名或密码）会被跳过
- 特殊字符在CSV中会被正确转义
- 转换后的文件可以直接导入到密码管理系统
        `);
    }
}

// 主程序
async function main() {
    // 检查命令行参数
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        FirefoxCsvConverter.showUsage();
        return;
    }

    // 解析命令行参数
    const args = process.argv.slice(2);
    const inputFile = args.find(arg => arg.startsWith('--input='))?.split('=')[1] || 'passwords.csv';
    const outputFile = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || 'converted-passwords.csv';

    const converter = new FirefoxCsvConverter();
    converter.inputFile = inputFile;
    converter.outputFile = outputFile;

    try {
        await converter.convert();
        console.log('\n🎉 转换完成！现在可以使用转换后的文件导入到密码管理系统中。');
        console.log('\n📝 下一步操作:');
        console.log('1. 启动密码管理系统: npm start 或 node app.js');
        console.log('2. 打开浏览器访问: http://localhost:3000');
        console.log('3. 点击"导入"按钮上传转换后的CSV文件');
        console.log('4. 选择来源为"Firefox"并确认导入');
    } catch (error) {
        console.error('❌ 转换失败:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = FirefoxCsvConverter;
