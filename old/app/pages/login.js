app.modules.login = {

	init: function(vars, req){

		loginForm();

		if(req && req['status']){
			switch(req['status']){
				case 'registered':
					app.commons.showDialog({
						body: app.lang['0001']
					});
				break;
				case 'logged-out':
					$.cookie('auth_token', '', { expires: 7, path: '/' });
					app.commons.showDialog({
						body: app.lang['0002']
					});
				break;
				case 'need-auth':
					app.commons.showDialog({
						body: app.lang['0003']
					});
				break;
			}
		}


		if(req && req['type']){
			switch(req['type']){
				case 'md':
				var id = "login";
					
					$.cookie('user_type', 'md', { expires: 7, path: '/' });

					
					vs.setVarsByControllerID('template', {
						title: 'MD Login',
						theme_color: 'blue',
						main_css_path: 'app/pages/register-md.css'
					});

					vs.setVarsByControllerID('login', {
						user_type: 'md',
						theme_color: 'blue'
					});	
						

				break;
				case 'pt':

					$.cookie('user_type', 'pt', { expires: 7, path: '/' });

					vs.setVarsByControllerID('template', {
						title: 'PT Login',
						theme_color: 'red',
						main_css_path: 'app/pages/register-pt.css'
					});

					vs.setVarsByControllerID('login', {
						user_type: 'pt',
						theme_color: 'red'
					});

				break;
			}

		}


		function loginForm(){

			$('#login-form').off('submit').on({
				submit: function(){

					var response = api.get('authenticateUser', {
						"username" : vs.getVar('username'),
						"password" : vs.getVar('password'),
						"usertype" : vs.getVar('user_type')
					});

					if(response){
						switch(response.response.code){
							case '00':
								$.cookie('auth_token', response.authToken, { expires: 7, path: '/' });
								window.location.hash= "#!/patient_information";
							break;
							case '99':
							case '01':
							case '02':
							case '201':
								app.commons.showDialog({
									body: response.response.message
								})
							break;
						}						
					}

					return false;
				}
			})

		}
	}
}