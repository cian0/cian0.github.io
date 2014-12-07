app.modules.login = {

	init: function(vars){
		vs.setVarByControllerID('template','title','MD Login');

		loginForm();

		function loginForm(){

			$('#login-form').on({
				submit: function(){
					var response = api.get('user.validate');
					if(response){
						window.location.hash= "#!/patient_information";
					} else {
						alert('Not authorized!');
					}
				}
			})
		}
	}
}