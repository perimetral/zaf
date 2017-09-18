const User = require('./User');

const findMatch = async (user) => {
	return await $.users.a_find({ $where: function () {
		let self = this;
		if (self.sid === user.sid) return false;
		if (user.mode !== $.cfg.modes.calm) return false;
		if ((self.mode !== $.cfg.modes.calm) && (self.mode !== $.cfg.modes.talking)) return false;
		if (self.mode === $.cfg.modes.talking) return (self.echo === user.sid);

		if (user.externalUngendered) {
			if (self.internalGender !== null) return false;
		} else {
			if ((self.internalGender === 'male') && (! user.externalGenders.includes('male'))) return false;
			if ((self.internalGender === 'female') && (! user.externalGenders.includes('female'))) return false;
			if (self.internalGender === null) return false;
		};
		if ((user.externalAgeFrom !== '-') && (user.externalAgeFrom > self.internalAge)) return false;
		if ((user.externalAgeTo !== '-') && (user.externalAgeTo < self.internalAge)) return false;
		if (user.externalLocation.length && (user.externalLocation !== self.internalLocation)) return false;

		if (self.externalUngendered) {
			if (user.internalGender !== null) return false;
		} else {
			if ((user.internalGender === 'male') && (! self.externalGenders.includes('male'))) return false;
			if ((user.internalGender === 'female') && (! self.externalGenders.includes('female'))) return false;
			if (user.internalGender === null) return false;
		};
		if ((self.externalAgeFrom !== '-') && (self.externalAgeFrom > user.internalAge)) return false;
		if ((self.externalAgeTo !== '-') && (self.externalAgeTo < user.internalAge)) return false;
		if (self.externalLocation.length && (self.externalLocation !== user.internalLocation)) return false;

		return true;
	}});
};

async function doLookup (user, data) {
	return new Promise(async (go, stop) => {
		if (typeof(data) !== typeof({})) return stop(new Error(`DATA TYPE ERROR`));
		let matched = await findMatch(user);
		if (matched.length)	return go(matched[Math.ceil(Math.random() * matched.length) - 1]);
		setTimeout(() => {
			doLookup(user, data).then((match) => {
				return go(match);
			}).catch((e) => {
				return stop(e);
			});
		}, $.cfg.relookupDelay);
	});
};

const handler = async (socket) => {
	let user = new User(socket.id);

	try { await $.tools.updateOnline();
	} catch (e) { console.log(`ONLINE USERS COUNT UPDATE ERROR: ${e}`); };
	socket.emit('user_connected');

	socket.on('begin_looking', async (data) => {
		socket.emit('user_began_lookup');
		await user.init(data);
		let match = await doLookup(user, data);
		user = await user.update({
			mode: $.cfg.modes.talking,
			echo: match.sid,
		});
		socket.emit('match_found');
	});
	socket.on('user_message', async (message) => {
		if (user.mode !== $.cfg.modes.talking) {
			console.log(`USER ${user.sid} IS IN INVALID MODE TO CHAT`);
			return;
		};
		socket.to(user.echo).emit('user_message', message);
	});
	socket.on('notify_print', async () => {
		if (user.mode !== $.cfg.modes.talking) return;
		socket.to(user.echo).emit('notify_print_response');
	});
	socket.on('stop_chat', async () => {
		socket.to(user.echo).emit('stop_chat_request');
		await $.users.a_remove({ sid: user.sid });
		user = new User(socket.id);
	});
	socket.on('stop_chat_response', async (cb) => {
		await $.users.a_remove({ sid: user.sid });
		user = new User(socket.id);
		cb();
	});
	socket.on('disconnect', async (reason) => {
		try { await $.users.a_remove({ sid: socket.id });
		} catch (e) { console.log(`USER ${socket.id} CLEANING ERROR: ${e}`); };
		try { await $.tools.updateOnline();
		} catch (e) { console.log(`ONLINE USERS COUNT UPDATE ERROR: ${e}`); };
		return;
	});
};

module.exports = handler;