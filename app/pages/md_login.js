app.modules.md_login = {

	init: function(vars){

		$.cookie('user_type', 'md', { expires: 7, path: '/' });

		vs.display('login');

		vs.setVarsByControllerID('template', {
			title: 'MD Login',
			theme_color: 'blue'
		});

		vs.setVarsByControllerID('login', {
			user_type: 'md',
			theme_color: 'blue'
		});
	}
}