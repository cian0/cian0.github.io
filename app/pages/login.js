app.modules.login = {

	init: function(vars, req){

		loginForm();

		switch(req['status']){
			case 'registered':
				app.commons.showDialog({
					body: "You have successfully registered. You may now log in below."
				});
			break;
			case 'logged-out':
				$.cookie('auth_token', '', { expires: 7, path: '/' });
				app.commons.showDialog({
					body: "You have been logged out."
				});
			break;
		}

		function loginForm(){

			$('#login-form').off('submit').on({
				submit: function(){
					var response = api.get('user.validate');

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
			})
		}
	}
}