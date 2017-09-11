const tools = {};

const crypto = require('crypto');

tools.randomStringSync = (len = 16, encoding = 'hex') => {
	return crypto.randomBytes(len).toString(encoding);
};

module.exports = tools;