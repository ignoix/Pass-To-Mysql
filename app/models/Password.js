const Database = require('../utils/database');

/**
 * 密码模型
 */
class Password {
    constructor() {
        this.db = new Database();
    }

    /**
     * 获取所有密码
     */
    async getAll(searchTerm = '', page = 1, limit = 20) {
        return await this.db.queryPasswords(searchTerm, page, limit);
    }

    /**
     * 根据ID获取密码
     */
    async getById(id) {
        return await this.db.findById(id);
    }

    /**
     * 添加密码
     */
    async create(passwordData) {
        const { name, url, username, password, note, from } = passwordData;
        return await this.db.insert(name, url, username, password, note, from);
    }

    /**
     * 更新密码
     */
    async update(id, passwordData) {
        const { name, url, username, password, note, from } = passwordData;
        return await this.db.updateById(id, name, url, username, password, note, from);
    }

    /**
     * 删除密码
     */
    async delete(id) {
        return await this.db.deleteById(id);
    }

    /**
     * 获取统计信息
     */
    async getStats() {
        return await this.db.getStats();
    }

    /**
     * 获取总数
     */
    async getTotalCount(searchTerm = '') {
        return await this.db.getTotalCount(searchTerm);
    }

    /**
     * 导入密码文件
     */
    async importFile(filePath, source = 'Chrome') {
        const fs = require('fs');
        const csv = require('csv-parser');
        
        return new Promise((resolve, reject) => {
            const allData = [];
            
            // 先读取所有数据
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => {
                    allData.push(data);
                })
                .on('end', async () => {
                    let insertedCount = 0;
                    let updatedCount = 0;
                    let skippedCount = 0;
                    
                    // 逐个处理每条记录
                    for (const data of allData) {
                        try {
                            const { name, url, username, password, note } = data;
                            
                            if (!name || !url || !username || !password) {
                                skippedCount++;
                                continue;
                            }
                            
                            // 检查是否已存在
                            const existing = await this.db.findExisting(name, url, username, source);
                            
                            if (existing) {
                                // 比较密码是否相同
                                const isSamePassword = await this.db.comparePassword(existing.id, password);
                                
                                if (isSamePassword) {
                                    skippedCount++;
                                } else {
                                    // 更新密码
                                    await this.db.update(existing.id, password, note);
                                    updatedCount++;
                                }
                            } else {
                                // 插入新记录
                                await this.db.insert(name, url, username, password, note, source);
                                insertedCount++;
                            }
                        } catch (error) {
                            console.error('处理记录失败:', error);
                            skippedCount++;
                        }
                    }
                    
                    resolve({
                        inserted: insertedCount,
                        updated: updatedCount,
                        skipped: skippedCount,
                        fileName: require('path').basename(filePath)
                    });
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    }
}

module.exports = Password;
