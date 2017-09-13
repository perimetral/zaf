const tools = {};

const crypto = require('crypto');
const uuid = require('node-uuid').v4;

tools.randomStringSync = (len = 16, encoding = 'hex') => {
	return crypto.randomBytes(len).toString(encoding);
};
tools.updateOnline = async () => {
	return new Promise((go, stop) => {
		$.io.clients((e, clients) => {
			if (e) return stop(e);
			let online = $.state.usersOnline = clients.length;
			$.io.emit('onlineUpdate', online);
			return go();
		});
	});
};
tools.uuid = async () => {
	return uuid();
};
tools.promisifyNeDB = (db) => {
	db.a_insert = async (...data) => {
		return new Promise((go, stop) => {
			db.insert(...data, (e, ...results) => {
				if (e) return stop(e);
				return go(...results);
			});
		});
	};
	db.a_find = async (...data) => {
		return new Promise((go, stop) => {
			db.find(...data, (e, ...results) => {
				if (e) return stop(e);
				return go(...results);
			});
		});
	};
	db.a_findOne = async (...data) => {
		return new Promise((go, stop) => {
			db.findOne(...data, (e, ...results) => {
				if (e) return stop(e);
				return go(...results);
			});
		});
	};
	db.a_count = async (...data) => {
		return new Promise((go, stop) => {
			db.count(...data, (e, ...results) => {
				if (e) return stop(e);
				return go(...results);
			});
		});
	};
	db.a_update = async (query, patch, options) => {
		return new Promise((go, stop) => {
			db.update(query, patch, options, (e, numAffected, affectedDocuments, upsert) => {
				if (e) return stop(e);
				return go(numAffected, affectedDocuments, upsert);
			});
		});
	};
	db.a_remove = async (...data) => {
		return new Promise((go, stop) => {
			db.remove(...data, (e, ...results) => {
				if (e) return stop(e);
				return go(...results);
			});
		});
	};
	return db;
};

module.exports = tools;