const BaseRest = require('../rest.js');

module.exports = class extends BaseRest {
    // token 生成
    async getAction() {
        await this.session(null);
        return this.success();
    }
};