const cfg = {};

const tools = require('./lib/tools');

cfg.host = 'zafchat.herokuapp.com';
cfg.port = process.env.PORT || 3000;
cfg.heroku = true;
cfg.mode = 'production';
cfg.morganMode = 'combined';
cfg.defaultLayout = 'main';

cfg.paths = {};
cfg.paths.static = './public';
cfg.paths.sessionStore = './db/sessionStore.db';

cfg.session = {};
cfg.session.secret = tools.randomStringSync(32);
cfg.session.resave = true;
cfg.session.saveUninitialized = true;
cfg.session.cookie = {
	path: '/',
	maxAge: 24 * 3600 * 1000,
};
cfg.session.unset = 'destroy';

cfg.https = {};
cfg.https.enabled = false;

cfg.db = {};
cfg.db.inMemoryOnly = true;

module.exports = cfg;

