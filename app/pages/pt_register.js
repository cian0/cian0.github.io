app.modules.pt_register = {

	init: function(vars){

		vs.display('register', {
			user_type: 'pt'
		});

		vs.setVarsByControllerID('template', {
			title: 'PT Account Registration',
			theme_color: 'red'
		});
	}
}