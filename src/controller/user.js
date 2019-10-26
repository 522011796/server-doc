const Base = require('./base.js');

module.exports = class extends Base {
  selectUserAction() {
    var obj = {
        a: 1
    };
      return this.success(obj);
    //return this.display();
  }
};
