app.commons = {
	'showDialog': function(args){
		console.log(args);

		if(args.title){
			$('#generic_popup .modal-header').show();
			$('#generic_popup .modal-header').html(args.title);
		} else {
			$('#generic_popup .modal-header').hide();
		}

		if(args.body){
			$('#generic_popup .modal-body').show();
			$('#generic_popup .modal-body').html(args.body);
		} else {
			$('#generic_popup .modal-body').hide();
		}

		$('#generic_popup').modal('show');
	},
	'logout': function(){

		var response = api.get('destroyAuthToken', {
			"username" : vs.getVar('username'),
			"password" : vs.getVar('password'),
			"usertype" : vs.getVar('user_type')
		});

		if(response){
			switch(response.response.code){
				case '00':
					var user_type = $.cookie('user_type');
					window.location.hash= "#!/login?type=" + user_type + "&status=logged-out";
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
	},
	'showPreloader':function(show){
		if(show) $('#generic_preloader').addClass('in');
		else{
			var delay = app.settings.demoMode?2000:0;
			if(app.settings.demoMode)
			window.setTimeout(
				function(){
					 $('#generic_preloader').removeClass('in');
				} ,delay
			);
		}
	}
}
