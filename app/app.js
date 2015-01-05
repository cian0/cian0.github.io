var app = {
	onReady: function(){
		/* Initialize Vivid Speech */
		angular.bootstrap(document, ['App']);
		
		vs.init();
	},
	modules: {},
	settings: {},
}

var api = {
	get: function(path, args, headers, type){

		if(!app.settings.demoMode){
			return api[path](args, headers, type);
		} else {
			return app.tests[app.data.lastPageRendered].events[path]();
		}
	},
	errormsg: function(){
		app.commons.showDialog({
			title: "Error",
			body: "An error has occured."
		})
	},
	ajaxRequest: function(params){
		var response;

		if(params.headers){

		} else {
			params.headers = {}			
		}

		params.headers['X-Auth-Token'] = $.cookie('auth_token');

		if(app.settings.debugMode){
			console.log('args: ' + JSON.stringify(params.args));
			console.log('header: ' + JSON.stringify(params.headers));
		}

		$.ajax({
			type: (params.type ? params.type : "POST"),
			url: params.url,
			data: params.args,
			headers: params.headers,
			dataType: 'json',
			async: false
		})
		.done(function(json) {
			response = json;
		})
		.fail(function(){
			api.errormsg();
		});
		
		return response;
	},
	'authenticateUser': function(args){
		console.log(JSON.stringify(args));
		return(api.ajaxRequest({
			url: "http://onequestpletaal.com.ph/public/api/authenticate",
			args: args
		}));
	},
	'user.register': function(args){
		return(api.ajaxRequest({
			url: "http://onequestpletaal.com.ph/public/api/createUser",
			args: args
		}));
	},
	'fetchPatientInfo': function(args, headers){
		return(api.ajaxRequest({
			url: "",
			args: args,
			headers: headers
		}));
	},
	'fetchPatientInfoDetails': function(args, headers){
		return(api.ajaxRequest({
			url: "",
			args: args,
			headers: headers
		}));
	},
	'assignPatientInformation': function(args, headers){
		return(api.ajaxRequest({
			url: "",
			args: args,
			headers: headers
		}));
	},
	'fetchEvaluationFormDetails': function(args, headers){
		return(api.ajaxRequest({
			url: "",
			args: args,
			headers: headers
		}));
	},
	'updateEvaluationFormDetails': function(args, headers){
		return(api.ajaxRequest({
			url: "",
			args: args,
			headers: headers
		}));
	},
	'validateEvaluationForm': function(args, headers){
		return(api.ajaxRequest({
			url: "",
			args: args,
			headers: headers
		}));
	},
	'approveEvaluationForm': function(args, headers){
		return(api.ajaxRequest({
			url: "",
			args: args,
			headers: headers
		}));
	},
	'destroyAuthToken': function(args, headers){
		return(api.ajaxRequest({
			url: "http://onequestpletaal.com.ph/public/api/destroyAuthToken",
			args: args,
			headers: headers
		}));
	},
	'provinces': function(args, headers, type){
		return(api.ajaxRequest({
			url: "http://onequestpletaal.com.ph/public/api/provinces",
			args: args,
			headers: headers,
			type: type
		}));
	},
	'fetchPTs': function(args, headers) {
		return(api.ajaxRequest({
			url: "http://onequestpletaal.com.ph/public/api/fetchPTs",
			args: args,
			headers: headers
		}));
	}
}