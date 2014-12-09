app.modules.md_login = {

	init: function(vars){
		$.cookie('user_type', 'md', { expires: 7, path: '/' });
		vs.display('login');
		vs.setVarByControllerID('template','title','MD Login');
		vs.setVarByControllerID('template','theme_color','blue');
		vs.setVarByControllerID('login','theme_color','blue');
	}
}