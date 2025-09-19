/**
 * 环境工具类
 */
class EnvUtils {
    /**
     * 判断是否为生产环境
     * @returns {boolean}
     */
    static isProduction() {
        return process.env.NODE_ENV === 'production';
    }

    /**
     * 判断是否为开发环境
     * @returns {boolean}
     */
    static isDevelopment() {
        return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    }

    /**
     * 判断是否为测试环境
     * @returns {boolean}
     */
    static isTest() {
        return process.env.NODE_ENV === 'test';
    }

    /**
     * 在生产环境下静默执行，开发环境下执行
     * @param {Function} callback 要执行的函数
     * @param {...any} args 函数参数
     */
    static silentInProduction(callback, ...args) {
        if (!this.isProduction()) {
            callback(...args);
        }
    }

    /**
     * 在开发环境下执行，生产环境下静默
     * @param {Function} callback 要执行的函数
     * @param {...any} args 函数参数
     */
    static onlyInDevelopment(callback, ...args) {
        if (this.isDevelopment()) {
            callback(...args);
        }
    }

    /**
     * 根据环境执行不同的函数
     * @param {Function} devCallback 开发环境执行的函数
     * @param {Function} prodCallback 生产环境执行的函数
     * @param {...any} args 函数参数
     */
    static executeByEnv(devCallback, prodCallback, ...args) {
        if (this.isProduction()) {
            if (prodCallback) prodCallback(...args);
        } else {
            if (devCallback) devCallback(...args);
        }
    }
}

module.exports = EnvUtils;
