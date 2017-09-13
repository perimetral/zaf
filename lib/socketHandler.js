const User = require('./User');

const initUser = async (sid) => {
	let uid = await $.tools.uuid();
	let user = new User(uid, sid);
	let dump = await user.dump();
	try { await $.users.a_insert(dump);
	} catch (e) { throw e; };
	return user;
};

const patchUser = async (sid, gender, age, location) => {
	let solid = await $.users.a_findOne({ sid });
	if (! solid) try { solid = await initUser(sid);
	} catch (e) { console.log(`USER ${solid.uid}:${sid} INIT ERROR: ${e}`); };
	let patch = {};
	let patchNeeded = false;
	if (solid.gender !== gender) {
		patchNeeded = true;
		patch.gender = gender;
	};
	if (solid.age !== age) {
		patchNeeded = true;
		patch.age = age;
	};
	if (solid.location !== location) {
		patchNeeded = true;
		patch.location = location;
	};
	if (patchNeeded) try { await $.users.a_update({ uid: solid.uid }, { $set: patch }, {
		multi: false,
		upsert: false,
	}); } catch (e) { console.log(`USER ${solid.uid}:${sid} UPDATE ERROR: ${e}`); };
	return solid.uid;
};

const performLookup = async (externalMaleInclude, externalFemaleInclude, externalAgeFrom, externalAgeTo, externalLocation) => {
	let match = $.users.a_find({ $where: function () {
		let self = this;
		let pass = true;
		if ((! externalMaleInclude) && (self.gender === 'male')) pass = false;
		if ((! externalFemaleInclude) && (self.gender === 'female')) pass = false;
		if ((externalAgeFrom !== '-') && (externalAgeFrom > self.age)) pass = false;
		if ((externalAgeTo !== '-') && (externalAgeTo < self.age)) pass = false;
		if (externalLocation && (externalLocation !== self.location)) pass = false;
		return pass;
	}});
	return match;
};

const handler = async (socket) => {
	let sid = socket.id;
	let user = undefined;
	let dump = await $.users.a_findOne({ sid });
	if (! dump) {
		try { user = await initUser(sid);
		} catch (e) { console.log(`USER ${uid}:${sid} INIT ERROR: ${e}`); };
		try { await $.tools.updateOnline();
		} catch (e) { console.log(`ONLINE USERS COUNT UPDATE ERROR: ${e}`); };
		socket.emit('user_registered');
	} else {
		user = new User(dump.uid, sid);
		socket.emit('user_reconnected');
	};

	socket.on('begin_looking', async (data) => {
		if (typeof(data) !== typeof({})) {
			console.log(`DATA TYPE ERROR`);
			return null;
		};
		let internalGender = 'internalGender' in data ? data.internalGender : null;
		let internalAge = 'internalAge' in data ? data.internalAge : '-';
		let internalLocation = 'internalLocation' in data ? data.internalLocation : '';
		let externalMaleInclude = 'externalMaleInclude' in data ? data.externalMaleInclude : true;
		let externalFemaleInclude = 'externalFemaleInclude' in data ? data.externalFemaleInclude : true;
		let externalAgeFrom = 'externalAgeFrom' in data ? data.externalAgeFrom : '-';
		let externalAgeTo = 'externalAgeTo' in data ? data.externalAgeTo : '-';
		let externalLocation = 'externalLocation' in data ? data.externalLocation : '';
		let uid = undefined;
		try { uid = await patchUser(sid, internalGender, internalAge, internalLocation);
		} catch (e) { console.log(`USER ${uid}:${sid} PATCH ERROR: ${e}`); };
		let matched = await performLookup(externalMaleInclude, externalFemaleInclude, externalAgeFrom, externalAgeTo, externalLocation);
		console.log(matched);
	});
};

module.exports = handler;