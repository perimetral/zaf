#!/usr/bin/env node
global.$ = {};
$.cfg = require('./config');
$.tools = require('./lib/tools');
$.state = {};

const express = require('express');
const session = require('express-session');
const socketio = require('socket.io');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const hbs = require('express-handlebars');

const NeDB = require('nedb');
const NedbSessionStore = require('nedb-session-store')(session);
const protocol = require($.cfg.https.enabled ? 'https' : 'http');

const app = express();

$.state.dbReady = false;
$.state.usersOnline = 0;

app.use(morgan($.cfg.morganMode));
app.use(express.static($.cfg.paths.static));
app.use(session({
	secret: $.cfg.session.secret,
	resave: $.cfg.session.resave,
	saveUninitialized: $.cfg.session.saveUninitialized,
	cookie: $.cfg.session.cookie,
	store: new NedbSessionStore({
		inMemoryOnly: $.cfg.db.inMemoryOnly,
		autoload: true,
		onload: (e) => {
			if (e) console.log(`IN-MEMORY SESSIONS DB ERROR: ${e}`);
			console.log(`IN-MEMORY SESSIONS DB STARTED`);
		},
	}),
	unset: $.cfg.session.unset,
}));
app.engine('handlebars', hbs({
	defaultLayout: $.cfg.defaultLayout,
}));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: true }));

let users = new NeDB({
	inMemoryOnly: $.cfg.db.inMemoryOnly,
	autoload: true,
	onload: (e) => {
		if (e) console.log(`IN-MEMORY USERS DB ERROR: ${e}`);
		console.log(`IN-MEMORY USERS DB STARTED`);
		$.state.dbReady = true;
	},
});
users.persistence.stopAutocompaction();
$.users = $.tools.promisifyNeDB(users);

app.get('/', (req, res, next) => {
	return res.render('main', {
		iouri: `${($.cfg.https.enabled || $.cfg.heroku) ? 'https' : 'http'}://${$.cfg.host}${$.cfg.port !== 80 ? ":" + $.cfg.port : ''}`,
		mode: $.cfg.mode,
	});
});

const socketHandler = require('./lib/socketHandler');
let server = protocol.Server(app);
$.io = socketio(server);

$.io.on('connection', (socket) => {
	socketHandler(socket).then((result) => {
		if (result) console.log(`SOCKET RESULT: ${result}`);
	}).catch((e) => {
		if (e) console.log(`SOCKET ERROR: ${e}`);
	});
});

server.listen($.cfg.port, () => {
	console.log(`LISTENING ON ${$.cfg.port}`);
});