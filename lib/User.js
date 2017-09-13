const copy = require('deepcopy');

class User {
	constructor (uid, sid) {
		this.uid = uid;
		this.sid = sid;
		this.gender = undefined;
		this.age = '-';
		this.location = '';
	}
	async dump () {
		return {
			uid: this.uid,
			sid: this.sid,
			gender: this.gender,
			age: this.age,
			location: this.location,
		};
	}
};

module.exports = User;