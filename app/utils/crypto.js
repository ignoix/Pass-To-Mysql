const CryptoJS = require('crypto-js');
const EnvUtils = require('./env');

/**
 * 加密工具类
 */
class Crypto {
    constructor(secretKey) {
        this.secretKey = secretKey;
    }

    /**
     * 加密密码
     * @param {string} password 明文密码
     * @returns {string} 加密后的密码
     */
    encrypt(password) {
        try {
            const encrypted = CryptoJS.AES.encrypt(password, this.secretKey).toString();
            return encrypted;
        } catch (error) {
            EnvUtils.silentInProduction(() => {
                console.error('加密失败:', error.message);
            });
            throw new Error('密码加密失败');
        }
    }

    /**
     * 解密密码
     * @param {string} encryptedPassword 加密的密码
     * @returns {string} 解密后的明文密码
     */
    decrypt(encryptedPassword) {
        try {
            const decrypted = CryptoJS.AES.decrypt(encryptedPassword, this.secretKey);
            const password = decrypted.toString(CryptoJS.enc.Utf8);
            
            if (!password) {
                throw new Error('解密失败，可能是密钥不正确');
            }
            
            return password;
        } catch (error) {
            EnvUtils.silentInProduction(() => {
                console.error('解密失败:', error.message);
            });
            throw new Error('密码解密失败');
        }
    }

    /**
     * 验证密钥是否正确
     * @param {string} testPassword 测试密码
     * @returns {boolean} 密钥是否正确
     */
    validateKey(testPassword = 'test') {
        try {
            const encrypted = this.encrypt(testPassword);
            const decrypted = this.decrypt(encrypted);
            return decrypted === testPassword;
        } catch (error) {
            return false;
        }
    }
}

module.exports = Crypto;
