var app = {
	onReady: function(){
		/* Initialize Vivid Speech */
		vs.init();
	},
	modules: {},
	settings: {},
}

var api = {
	get: function(path){
		if(!app.settings.demoMode){
			return api[path]();
		} else {
			return app.tests[app.data.lastPageRendered].events[path]();
		}
	},
	'user.validate': function(){
		return false;
	},
	'user.register': function(){
		return false;
	},
}