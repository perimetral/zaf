const $byid = document.getElementById;

let socket = io.connect(staticData.iouri);

let app = new Vue({
	el: '#app',
	delimiters: [ ':[', ']' ],
	data: {
		page: staticData.defaultPage,
		lang: staticData.defaultLang,
		ageValues: [],
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
	},
	created: function () {
		this.updateTitle();
		for (let i = staticData.minAge; i < staticData.maxAge; i++) this.ageValues.push(i);
	},
});
console.log(app);