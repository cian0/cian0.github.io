app.modules.md_register = {

	init: function(vars){
		
		vs.display('register', {
			user_type: 'md'
		});

		vs.setVarsByControllerID('template', {
			title: 'MD Account Registration',
			theme_color: 'blue'
		});
	}
}