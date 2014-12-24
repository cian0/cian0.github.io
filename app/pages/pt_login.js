app.modules.pt_login = {

	init: function(vars){

		$.cookie('user_type', 'pt', { expires: 7, path: '/' });

		vs.display('login');

		vs.setVarsByControllerID('template', {
			title: 'PT Login',
			theme_color: 'red'
		});

		vs.setVarsByControllerID('login', {
			user_type: 'pt',
			theme_color: 'red'
		});
	}
}