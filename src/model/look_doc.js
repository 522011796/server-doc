module.exports = class extends think.Model {
    // 添加文章
    async insert(data) {
        const id = await this.add(data);
        return id;
    }
};