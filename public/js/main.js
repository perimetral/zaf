let parts = staticData.iouri.split(':');
if (parts.length > 1) staticData.iouri = staticData.iouri[0];
let socket = io.connect(staticData.iouri);

let ageValues = [];
for (let i = staticData.minAge; i < staticData.maxAge; i++) ageValues.push(i);

let app = new Vue({
	el: '#app',
	delimiters: [ ':[', ']' ],
	data: {
		page: staticData.defaultPage,
		lang: staticData.defaultLang,
		ageValues,
		searchStatus: null,
		endReason: null,
		externalTyping: false,
		usersOnline: 0,
		down_strangerGender: true,
		internalGender: null,
		internalAge: '-',
		internalLocation: '',
		externalMaleInclude: true,
		externalFemaleInclude: true,
		externalAgeFrom: '-',
		externalAgeTo: '-',
		externalLocation: '',
		messages: [],
	},
	methods: {
		dumpPrefs: function () {
			return {
				internalGender: this.internalGender,
				internalAge: this.internalAge,
				internalLocation: this.internalLocation,
				externalMaleInclude: this.externalMaleInclude,
				externalFemaleInclude: this.externalFemaleInclude,
				externalAgeFrom: this.externalAgeFrom,
				externalAgeTo: this.externalAgeTo,
				externalLocation: this.externalLocation,
			};
		},
		switchPage: function (page) {
			this.page = page;
		},
		switchLang: function (ev) {
			let lang = ev.target.selectedOptions[0].value.toLowerCase();
			this.lang = lang;
			this.updateTitle();
		},
		updateTitle: function () {
			document.title = staticData.title[this.lang];
		},
		clickInactive: function (ev, inactiveController) {
			if (this[inactiveController]) {
				ev.preventDefault();
				ev.stopPropagation();
			};
		},
		chooseInternalGender: function (gender) {
			this.down_strangerGender = gender ? false : true;
			this.internalGender = gender;
		},
		chooseInitialAge: function () {
			this.internalAge = '-';
		},
		chooseInitialLocation: function () {
			this.internalLocation = '';
		},
		connect: function () {
			let query = this.dumpPrefs();
			socket.emit('begin_looking', query);
			this.searchStatus = 'looking';
			this.switchPage('chat');
		},
		sendMessage: function () {
			let boxEl = document.getElementById('inputMessageBox');
			let message = boxEl.value;
			if ((message.length < 1) || (message.length > staticData.messageMaxLen)) return false;
			socket.emit('user_message', message);
			let time = new Date();
			let stamp = time.toLocaleTimeString();
			this.messages.push({
				internal: true,
				timestamp: stamp,
				text: message,
			});
			boxEl.value = '';
			boxEl.focus();
		},
		endChatInternal: function () {
			this.searchStatus = 'end';
			this.endReason = 'internal';
			socket.emit('stop_chat');
		},
		continueSearch: function () {
			this.switchPage('dummy');
			this.messages.splice(0, this.messages.length);
			this.searchStatus = null;
			this.endReason = null;
			let query = this.dumpPrefs();
			socket.emit('begin_looking', query);
			this.searchStatus = 'looking';
			this.switchPage('chat');
		},
		changePrefs: function () {
			this.messages.splice(0, this.messages.length);
			this.searchStatus = null;
			this.endReason = null;
			this.switchPage('welcome');
		},
	},
	created: function () {
		this.updateTitle();
	},
});

socket.on('user_message', (message) => {
	let time = new Date();
	let stamp = time.toLocaleTimeString();
	app.messages.push({
		internal: false,
		timestamp: stamp,
		text: message,
	});
});
socket.on('stop_chat_request', () => {
	socket.emit('stop_chat_response', () => {
		app.searchStatus = 'end';
		app.endReason = 'external';
	});
});
socket.on('match_found', () => {
	app.searchStatus = 'found';
});
socket.once('user_connected', () => {
//	console.log('user_connected');
});
socket.on('user_began_lookup', () => {
//	console.log('user_began_lookup');
});
socket.on('onlineUpdate', (data) => {
//	console.log(`onlineUpdate: ${data}`);
	app.usersOnline = data;
});