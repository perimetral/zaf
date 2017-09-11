global.$ = {};
$.cfg = require('./config');
$.tools = require('./lib/tools');

const express = require('express');
const nedb = require('nedb');
const session = require('express-session');
const socketio = require('socket.io');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const hbs = require('express-handlebars');
const NedbSessionStore = require('nedb-session-store')(session);
const protocol = require($.cfg.https.enabled ? 'https' : 'http');

const app = express();

app.use(morgan($.cfg.morganMode));
app.use(cookieParser);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static($.cfg.paths.static));
app.use(session({
	secret: $.cfg.session.secret,
	resave: $.cfg.session.resave,
	saveUninitialized: $.cfg.session.saveUninitialized,
	cookie: $.cfg.session.cookie,
	store: new NedbSessionStore({
		filename: $.cfg.paths.sessionStore,
	}),
	unset: $.cfg.session.unset,
}));
app.engine('hbs', hbs({
	defaultLayout: $.cfg.defaultLayout,
}));
app.set('view engine', 'hbs');

app.get('/', (req, res, next) => {
	console.log('atata');
	return res.render('mainp', {
		title: 'ZAF',
		test1: 'atata',
	});
});

const socketHandler = require('./lib/socketHandler');
let server = protocol.Server(app);
let io = socketio(server);

server.listen($.cfg.port, () => {
	console.log(`LISTENING ON ${$.cfg.port}`);
});

io.on('connection', (socket) => {
	socketHandler(socket).then((result) => {
		if (result) console.log(`SOCKET RESULT: ${result}`);
	}).catch((e) => {
		if (e) console.log(`SOCKET ERROR: ${e}`);
	});
});