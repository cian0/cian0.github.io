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
	}
}
