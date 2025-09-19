const Password = require('../models/Password');

/**
 * 密码控制器
 */
class PasswordController {
    constructor() {
        this.passwordModel = new Password();
    }

    /**
     * 获取密码列表
     */
    async getPasswords(ctx) {
        try {
            const { search = '', page = 1, limit = 20 } = ctx.query;
            const passwords = await this.passwordModel.getAll(search, parseInt(page), parseInt(limit));
            const total = await this.passwordModel.getTotalCount(search);
            
            ctx.body = {
                success: true,
                data: passwords,
                total: total,
                page: parseInt(page),
                limit: parseInt(limit)
            };
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * 根据ID获取密码
     */
    async getPasswordById(ctx) {
        try {
            const { id } = ctx.params;
            const password = await this.passwordModel.getById(id);
            
            if (!password) {
                ctx.status = 404;
                ctx.body = {
                    success: false,
                    message: '密码记录不存在'
                };
                return;
            }

            ctx.body = {
                success: true,
                data: password
            };
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * 创建密码
     */
    async createPassword(ctx) {
        try {
            const passwordData = ctx.request.body;
            const result = await this.passwordModel.create(passwordData);
            
            ctx.status = 201;
            ctx.body = {
                success: true,
                data: result,
                message: '密码创建成功'
            };
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * 更新密码
     */
    async updatePassword(ctx) {
        try {
            const { id } = ctx.params;
            const passwordData = ctx.request.body;
            const result = await this.passwordModel.update(id, passwordData);
            
            ctx.body = {
                success: true,
                data: result,
                message: '密码更新成功'
            };
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * 删除密码
     */
    async deletePassword(ctx) {
        try {
            const { id } = ctx.params;
            await this.passwordModel.delete(id);
            
            ctx.body = {
                success: true,
                message: '密码删除成功'
            };
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * 获取统计信息
     */
    async getStats(ctx) {
        try {
            const stats = await this.passwordModel.getStats();
            
            ctx.body = {
                success: true,
                data: stats
            };
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * 导入密码文件
     */
    async importPasswords(ctx) {
        try {
            if (!ctx.request.file) {
                ctx.status = 400;
                ctx.body = {
                    success: false,
                    message: '请选择要导入的CSV文件'
                };
                return;
            }

            const { source = 'Chrome' } = ctx.request.body;
            const filePath = ctx.request.file.path;
            const fileName = ctx.request.file.originalname;

            const result = await this.passwordModel.importFile(filePath, source);

            // 删除临时文件
            const fs = require('fs');
            fs.unlinkSync(filePath);

            ctx.body = {
                success: true,
                data: result,
                message: `导入完成！新增 ${result.inserted} 条，更新 ${result.updated} 条，跳过 ${result.skipped} 条`
            };
        } catch (error) {
            // 清理临时文件
            if (ctx.request.file && require('fs').existsSync(ctx.request.file.path)) {
                require('fs').unlinkSync(ctx.request.file.path);
            }
            
            ctx.status = 500;
            ctx.body = {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * 解密密码
     */
    async decryptPassword(ctx) {
        try {
            const { encryptedPassword, key } = ctx.request.body;
            
            if (!encryptedPassword || !key) {
                ctx.status = 400;
                ctx.body = {
                    success: false,
                    message: '缺少必要参数'
                };
                return;
            }

            const { Crypto } = require('../utils');
            const crypto = new Crypto(key);
            
            try {
                const decryptedPassword = crypto.decrypt(encryptedPassword);
                ctx.body = {
                    success: true,
                    data: { password: decryptedPassword }
                };
            } catch (error) {
                ctx.status = 400;
                ctx.body = {
                    success: false,
                    message: '密钥错误或密码格式不正确'
                };
            }
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                success: false,
                message: error.message
            };
        }
    }
}

module.exports = PasswordController;
