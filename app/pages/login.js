app.modules.login = {

	init: function(vars){

		loginForm();

		function loginForm(){

			$('#login-form').on({
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

					/*
					if(response){
						window.location.hash= "#!/patient_information";
					} else {
						alert('Not authorized!');
					}
					*/
				}
			})
		}
	}
}