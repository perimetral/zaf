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
	},
	methods: {
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
			let query = {
				internalGender: this.internalGender,
				internalAge: this.internalAge,
				internalLocation: this.internalLocation,
				externalMaleInclude: this.externalMaleInclude,
				externalFemaleInclude: this.externalFemaleInclude,
				externalAgeFrom: this.externalAgeFrom,
				externalAgeTo: this.externalAgeTo,
				externalLocation: this.externalLocation,
			};
			socket.emit('begin_looking', query);
		},
		sendMessage: function () {

		},
		endChat: function () {

		},
		continueSearch: function () {

		},
		changePrefs: function () {

		},
	},
	created: function () {
		this.updateTitle();
	},
});


socket.once('user_registered', () => {
	console.log('user_registered');
});
socket.on('user_reconnected', () => {
	console.log('user_reconnected');
});
socket.on('onlineUpdate', (data) => {
	console.log(`onlineUpdate: ${data}`);
	app.usersOnline = data;
});