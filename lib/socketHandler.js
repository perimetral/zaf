const User = require('./User');

const handler = async (socket) => {
	let sid = socket.id;
	let user = undefined;
	let dump = await $.users.a_findOne({ sid });
	if (! dump) {
		let uid = await $.tools.uuid();
		user = new User(uid, sid);
		dump = await user.dump();
		try { await $.users.a_insert(dump);
		} catch (e) { console.log(`USER ${uid}:${sid} INSERT ERROR: ${e}`); };
		try { await $.tools.updateOnline();
		} catch (e) { console.log(`ONLINE USERS COUNT UPDATE ERROR: ${e}`); };
		socket.emit('user_registered');
	} else {
		user = new User(dump.uid, sid);
		socket.emit('user_reconnected');
	};
};

module.exports = handler;