app.modules.pt_login = {

	init: function(vars){
		$.cookie('user_type', 'pt', { expires: 7, path: '/' });
		vs.display('login');
		vs.setVarByControllerID('template','title','PT Login');
		vs.setVarByControllerID('template','theme_color','red');
		vs.setVarByControllerID('login','theme_color','red');
	}
}