const copy = require('deepcopy');

class User {
	constructor (uid, sid) {
		this.uid = uid;
		this.sid = sid;
	}
	async dump () {
		return {
			uid: this.uid,
			sid: this.sid,
		};
	}
};

module.exports = User;