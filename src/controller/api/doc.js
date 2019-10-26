const BaseRest = require('../rest.js');

module.exports = class extends BaseRest {
    /**
     * 添加内容
     * @return {[type]} [description]
     */
    async postAction() {
        const userInfo = this.userInfo;
        const pageType = this.post("pageType");
        let data = {};
        if(pageType == "lately"){
            let lookTime = (new Date()).getTime() / 1000;
            //查询是否存在文档
            let sql = 'select FROM_UNIXTIME(b.look_time,"%Y-%m-%d") as lookTime, a.id,a.title,a.update_time,a.content,a.update_acthor, a.acthor_id, a.update_acthor as updateActhor, b.doc_id, b.look_time lookTimeInt from doc a, look_doc  b where a.id=b.doc_id and b.acthor_id="'+userInfo.id+'" and a.id="'+this.post("docId")+'"';
            let docData = data = await this.modelInstance.query(sql);
            let tempList = JSON.parse( JSON.stringify(docData));
            if(tempList.length > 0){
                data = {
                    doc_id: this.post("docId"),
                    acthor_id: userInfo.id,
                    look_time: lookTime
                };
                const id = await this.model('look_doc').where({doc_id: this.post("docId"), acthor_id: userInfo.id}).update({look_time: lookTime});
                if (id) {
                    //data.id = id;
                    //await this.hook('contentCreate', data);
                    return this.success({id: id}, '关联修改成功');
                } else {
                    return this.fail(500, '关联修改失败');
                }
            }else{
                data = {
                    doc_id: this.post("docId"),
                    acthor_id: userInfo.id,
                    look_time: lookTime
                };
                const id = await this.model('look_doc').add(data);
                if (id) {
                    data.id = id;
                    //await this.hook('contentCreate', data);
                    return this.success({id: id}, '关联成功');
                } else {
                    return this.fail(500, '关联失败');
                }
            }
        }else if(pageType == "delete"){
            let docId = this.post("docId");
            const id = await this.modelInstance.deleteData(this.post("docId"));
            if (id) {
                //删除关联的docId
                let sql = 'select FROM_UNIXTIME(b.look_time,"%Y-%m-%d") as lookTime, a.id,a.title,a.update_time,a.content,a.update_acthor, a.acthor_id, a.update_acthor as updateActhor, b.doc_id, b.look_time lookTimeInt from doc a, look_doc  b where a.id=b.doc_id and b.acthor_id="'+userInfo.id+'" and a.id="'+this.post("docId")+'"';
                let docData = data = await this.modelInstance.query(sql);
                let tempList = JSON.parse( JSON.stringify(docData));
                if(tempList.length > 0){
                    await this.where({docId: docId, acthor_id:userInfo.id}).delete();
                }

                return this.success({id: id}, '操作成功');
            } else {
                return this.fail(500, '操作失败');
            }
        }else if(pageType == "resetName"){
            let docId = this.post("docId");
            const id = await this.modelInstance.where({id: this.post("docId"), acthor_id: userInfo.id}).update({title: this.post("docTitle")});
            if (id) {
                return this.success({id: id}, '修改成功');
            } else {
                return this.fail(500, '修改失败');
            }
        }else{
            const createTime = this.post('create_time') ? (new Date(this.post('create_time'))).getTime() / 1000 : (new Date()).getTime() / 1000;
            if(this.post("docId") != undefined && this.post("docId") != ""){
                const id = await this.model('doc').where({id: this.post("docId")}).update({update_time: createTime, title: this.post("title"), content: this.post('content'),acthor_id: userInfo.id, acthor: userInfo.username});
                if (id) {
                    //data.id = id;
                    //await this.hook('contentCreate', data);
                    return this.success({id: id}, '修改成功');
                } else {
                    return this.fail(500, '修改失败');
                }
            }else{
                const data = {
                    acthor_id: userInfo.id,
                    acthor: userInfo.username,
                    title: this.post('title'),
                    content: this.post('content'),
                    create_time: createTime,
                    update_time: createTime,
                    update_acthor: userInfo.username
                };
                const id = await this.modelInstance.insert(data);
                if (id) {
                    data.id = id;
                    //await this.hook('contentCreate', data);
                    return this.success({id: id}, '添加成功');
                } else {
                    return this.fail(500, '添加失败');
                }
            }
        }
    }

    /**
     * 获取内容
     * @return {[type]} [description]
     */
    async getAction() {
        const userInfo = this.userInfo;
        const pageType = this.get("pageType");
        let data = {};
        if(pageType == "lately"){
            let sql = 'select FROM_UNIXTIME(b.look_time,"%Y-%m-%d") as lookTime, a.id,a.title,a.update_time,a.content,a.update_acthor, a.acthor_id, a.update_acthor as updateActhor, b.doc_id, b.look_time lookTimeInt from doc a, look_doc  b where a.id=b.doc_id and b.acthor_id="'+userInfo.id+'"';
            data = await this.modelInstance.query(sql);
            let tempList = JSON.parse( JSON.stringify(data));
            let map = {},dest = [];
            for (let i = 0; i < tempList.length; i++) {
                let ai = tempList[i];
                //ai['userInfo'] = userInfo;
                if (!map[ai.lookTime]) {
                    dest.push({
                        time: ai.lookTime,
                        data: [ai]
                    });
                    map[ai.lookTime] = ai;
                } else {
                    for (let j = 0; j < dest.length; j++) {
                        let dj = dest[j];
                        if (dj.time == ai.lookTime) {
                            dj.data.push(ai);
                            break;
                        }
                    }
                }
            }
            return this.success(dest);
        }else if(pageType == "create"){
            data = await this.modelInstance.where({acthor_id:userInfo.id}).field("FROM_UNIXTIME(update_time,'%Y-%m-%d') as updateTime,update_time as updateTimeInt,title,update_acthor as updateActhor,content,id").select();
            let tempList = JSON.parse( JSON.stringify(data));
            let map = {},dest = [];
            for (let i = 0; i < tempList.length; i++) {
                let ai = tempList[i];
                //ai['userInfo'] = userInfo;
                if (!map[ai.updateTime]) {
                    dest.push({
                        time: ai.updateTime,
                        data: [ai]
                    });
                    map[ai.updateTime] = ai;
                } else {
                    for (let j = 0; j < dest.length; j++) {
                        let dj = dest[j];
                        if (dj.time == ai.updateTime) {
                            dj.data.push(ai);
                            break;
                        }
                    }
                }
            }
            return this.success(dest);
        }else if(pageType == "detail"){
            data = await this.modelInstance.where({acthor_id:userInfo.id, id: this.get("docId")}).select();
            let tempList = JSON.parse( JSON.stringify(data));
            return this.success(tempList);
        }else{
            data = await this.modelInstance.field("FROM_UNIXTIME(update_time,'%Y-%m-%d') as updateTime,update_time as updateTimeInt,title,update_acthor as updateActhor,content,id").select();
            let tempList = JSON.parse( JSON.stringify(data));
            let map = {},dest = [];
            for (let i = 0; i < tempList.length; i++) {
                let ai = tempList[i];
                //ai['userInfo'] = userInfo;
                if (!map[ai.updateTime]) {
                    dest.push({
                        time: ai.updateTime,
                        data: [ai]
                    });
                    map[ai.updateTime] = ai;
                } else {
                    for (let j = 0; j < dest.length; j++) {
                        let dj = dest[j];
                        if (dj.time == ai.updateTime) {
                            dj.data.push(ai);
                            break;
                        }
                    }
                }
            }
            return this.success(dest);
        }
    }
};