const copy = require('deepcopy');

class User {
	constructor (sid) {
		this.sid = sid;
		this.ready = false;
		this.mode = $.cfg.modes.calm;
		this.echo = null;
	}
	async init (data) {
		if (this.mode !== $.cfg.modes.calm) throw new Error(`ERROR INIT USER ${this.sid}`);
		let spam = await $.users.a_findOne({ sid: this.sid });
		if (spam) await $.users.a_remove({ sid: this.sid });
		this.internalGender = 'internalGender' in data ? data.internalGender : null;
		this.internalAge = 'internalAge' in data ? data.internalAge : '-';
		this.internalLocation = 'internalLocation' in data ? data.internalLocation : '';
		this.externalGenders = [];
		this.externalUngendered = true;
		let externalMaleInclude = 'externalMaleInclude' in data ? data.externalMaleInclude : true;
		let externalFemaleInclude = 'externalFemaleInclude' in data ? data.externalFemaleInclude : true;
		if (externalMaleInclude) {
			this.externalGenders.push('male');
			this.externalUngendered = false;
		};
		if (externalFemaleInclude) {
			this.externalGenders.push('female');
			this.externalUngendered = false;
		};
		this.externalAgeFrom = 'externalAgeFrom' in data ? data.externalAgeFrom : '-';
		this.externalAgeTo = 'externalAgeTo' in data ? data.externalAgeTo : '-';
		this.externalLocation = 'externalLocation' in data ? data.externalLocation : '';
		this.ready = true;
		this.echo = null;
		await $.users.a_insert(await this.dump());
	}
	async update (patch) {
		if (! this.ready) throw new Error(`UNINITIALIZED USER ${this.sid}`);
		for (let i in patch) {
			if ((i in this) && (this[i] !== patch[i])) this[i] = patch[i];
		};
		await $.users.a_update({ sid: this.sid }, { $set: patch }, {
			multi: false,
			upsert: false,
		});
		return this;
	}
	async dump () {
		return {
			sid: this.sid,
			ready: this.ready,
			mode: this.mode,
			echo: this.echo,
			internalGender: this.internalGender,
			internalAge: this.internalAge,
			internalLocation: this.internalLocation,
			externalGenders: this.externalGenders,
			externalUngendered: this.externalUngendered,
			externalAgeFrom: this.externalAgeFrom,
			externalAgeTo: this.externalAgeTo,
			externalLocation: this.externalLocation,
		};
	}
};

module.exports = User;