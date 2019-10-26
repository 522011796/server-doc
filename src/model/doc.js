module.exports = class extends think.Model {
    // 添加文章
    async insert(data) {
        const id = await this.add(data);
        return id;
    }

    // 删除文章
    async deleteData(docId) {
        const id = await this.where({id: docId}).delete();
        return id;
    }
};