const $byid = document.getElementById;
let socket = io.connect(staticData.iouri);
let app = new Vue({
	el: '#app',
	delimiters: [ ':[', ']' ],
	data: {
		page: staticData.defaultPage,
		lang: staticData.defaultLang,
		ageValues: [],
		searchStatus: null,
		externalTyping: false,
		usersOnline: 0,
		down_strangerGenderMale: true,
		down_strangerGenderFemale: true,
		down_strangerAgeFrom: true,
		down_strangerAgeUpTo: true,
		down_strangerLocation: true,
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
		sendMessage: function () {

		},
		endChat: function () {

		},
		continueSearch: function () {

		},
		changePrefs: function () {

		},
		clickInactive: function (ev, inactiveController) {
			if (this[inactiveController]) {
				ev.preventDefault();
				ev.stopPropagation();
				//strangerAgeFrom strangerAgeUpTo
			};
		}
	},
	created: function () {
		this.updateTitle();
		for (let i = staticData.minAge; i < staticData.maxAge; i++) this.ageValues.push(i);
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