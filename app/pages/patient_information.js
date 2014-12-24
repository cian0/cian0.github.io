app.modules.patient_information = {

	init: function(vars){
		
		vs.setVarByControllerID('template','title','Patient Information - PT');

		var user_type = $.cookie('user_type');
		var theme_color;

		
		switch(user_type){
			case 'md':
				theme_color = 'blue';
			break;
			case 'pt':
				theme_color = 'red';
			break;
		}

		vs.setVarByControllerID('template','theme_color', theme_color);
		vs.setVar('theme_color', theme_color);
		vs.setVar('user_type', user_type);
		

		$('#patientinfo').bootstrapTable({
			striped: true,
			pagination: true,
			search: true,
			height: '600',
			sortable: true,
			sortorder: 'desc'
		});


			$('#patientinfo').bootstrapTable('append', {
				"padstroke":"PAD",
				"patientname":"test",
				"datereceived":"12312",
				"lastupdated":"7",
				"updatedby":"98",
				"assignedtopt":"1231",
				"status":"Submitted"
			});	
			$('#patientinfo').bootstrapTable('append', {
				"padstroke":"Stroke",
				"patientname":"test",
				"datereceived":"12312",
				"lastupdated":"7",
				"updatedby":"98",
				"assignedtopt":"1231",
				"status":"For Approval"
			});			
			$('#patientinfo').bootstrapTable('append', {
				"padstroke":"PAD",
				"patientname":"test",
				"datereceived":"12312",
				"lastupdated":"7",
				"updatedby":"98",
				"assignedtopt":"1231",
				"status":"Assigned"
			});	
			$('#patientinfo').bootstrapTable('append', {
				"padstroke":"Stroke",
				"patientname":"test",
				"datereceived":"12312",
				"lastupdated":"7",
				"updatedby":"98",
				"assignedtopt":"1231",
				"status":"Pending"
			});	
			$('#patientinfo').bootstrapTable('append', {
				"padstroke":"PAD",
				"patientname":"test",
				"datereceived":"12312",
				"lastupdated":"7",
				"updatedby":"98",
				"assignedtopt":"1231",
				"status":"Submitted"
			});	
			$('#patientinfo').bootstrapTable('append', {
				"padstroke":"Stroke",
				"patientname":"test",
				"datereceived":"12312",
				"lastupdated":"7",
				"updatedby":"98",
				"assignedtopt":"1231",
				"status":"For Approval"
			});			
			$('#patientinfo').bootstrapTable('append', {
				"padstroke":"PAD",
				"patientname":"test",
				"datereceived":"12312",
				"lastupdated":"7",
				"updatedby":"98",
				"assignedtopt":"1231",
				"status":"Assigned"
			});	
			$('#patientinfo').bootstrapTable('append', {
				"padstroke":"Stroke",
				"patientname":"test",
				"datereceived":"12312",
				"lastupdated":"7",
				"updatedby":"98",
				"assignedtopt":"1231",
				"status":"Pending"
			});	
			$('#patientinfo').bootstrapTable('append', {
				"padstroke":"PAD",
				"patientname":"test",
				"datereceived":"12312",
				"lastupdated":"7",
				"updatedby":"98",
				"assignedtopt":"1231",
				"status":"Submitted"
			});	
			$('#patientinfo').bootstrapTable('append', {
				"padstroke":"Stroke",
				"patientname":"test",
				"datereceived":"12312",
				"lastupdated":"7",
				"updatedby":"98",
				"assignedtopt":"1231",
				"status":"For Approval"
			});			
			$('#patientinfo').bootstrapTable('append', {
				"padstroke":"PAD",
				"patientname":"test",
				"datereceived":"12312",
				"lastupdated":"7",
				"updatedby":"98",
				"assignedtopt":"1231",
				"status":"Assigned"
			});	
			$('#patientinfo').bootstrapTable('append', {
				"padstroke":"Stroke",
				"patientname":"test",
				"datereceived":"12312",
				"lastupdated":"7",
				"updatedby":"98",
				"assignedtopt":"1231",
				"status":"Pending"
			});	
			$('#patientinfo').bootstrapTable('append', {
				"padstroke":"PAD",
				"patientname":"test",
				"datereceived":"12312",
				"lastupdated":"7",
				"updatedby":"98",
				"assignedtopt":"1231",
				"status":"Submitted"
			});	
			$('#patientinfo').bootstrapTable('append', {
				"padstroke":"Stroke",
				"patientname":"test",
				"datereceived":"12312",
				"lastupdated":"7",
				"updatedby":"98",
				"assignedtopt":"1231",
				"status":"For Approval"
			});			
			$('#patientinfo').bootstrapTable('append', {
				"padstroke":"PAD",
				"patientname":"test",
				"datereceived":"12312",
				"lastupdated":"7",
				"updatedby":"98",
				"assignedtopt":"1231",
				"status":"Assigned"
			});	
			$('#patientinfo').bootstrapTable('append', {
				"padstroke":"Stroke",
				"patientname":"test",
				"datereceived":"12312",
				"lastupdated":"7",
				"updatedby":"98",
				"assignedtopt":"1231",
				"status":"Pending"
			});			
			$('#patientinfo').bootstrapTable('append', {
				"padstroke":"PAD",
				"patientname":"test",
				"datereceived":"12312",
				"lastupdated":"7",
				"updatedby":"98",
				"assignedtopt":"1231",
				"status":"Submitted"
			});	
			$('#patientinfo').bootstrapTable('append', {
				"padstroke":"Stroke",
				"patientname":"test",
				"datereceived":"12312",
				"lastupdated":"7",
				"updatedby":"98",
				"assignedtopt":"1231",
				"status":"For Approval"
			});			
			$('#patientinfo').bootstrapTable('append', {
				"padstroke":"PAD",
				"patientname":"test",
				"datereceived":"12312",
				"lastupdated":"7",
				"updatedby":"98",
				"assignedtopt":"1231",
				"status":"Assigned"
			});	
			$('#patientinfo').bootstrapTable('append', {
				"padstroke":"Stroke",
				"patientname":"test",
				"datereceived":"12312",
				"lastupdated":"7",
				"updatedby":"98",
				"assignedtopt":"1231",
				"status":"Pending"
			});	
		

		var t = setTimeout(function(){
			$('#patientinfo').bootstrapTable({
				url: 'https://api.myjson.com/bins/2mbej'
			});
		}, 1000);
		
			


		function queryParams() {
			return {
				type: 'patientname',
				sort: 'lastupdated',
				direction: 'desc',
				per_page: 100,
				page: 1
			};
		}

		$(document).on('click', '#patientinfo tr', function(event) {
			
			$('#data_index').modal({
				show: true,
				keyboard: false,
				backdrop: 'static'
			});

			var $tr = $(this);
			var dataArray = [];

			$tr.find('td').each(function(){
				$td = $(this);
				dataArray.push( $td.html() );
			})

			var status = dataArray[5];
			var type = dataArray[0];

			vs.setVars({
				ptinfo_type: dataArray[0],
				ptinfo_name: dataArray[1],
				ptinfo_date_received: dataArray[2],
				ptinfo_last_updated: dataArray[3]
			});


			$(document).on('click', '#btn-initial-evaluation-form', function(event) {
				$('#data_index').modal('hide');	
				switch(type){
					case 'PAD':
						window.location.hash= "#!/initial_evaluation_form_pad";
					break;
					case 'Stroke':
						window.location.hash= "#!/initial_evaluation_form";
					break;
				}
			});			

			

			var userType = $.cookie('user_type');

			if(userType == 'md'){
				switch(status){
					case 'Submitted':
						$('#select_pt').attr('disabled','true');
						$('#btn-approve').hide();
						$('#btn-assign').hide();
					break;
					case 'For Approval':
						$('#select_pt').attr('disabled','true');
						$('#btn-approve').show();
						$('#btn-assign').hide();
					break;
					case 'Assigned':
						$('#select_pt').attr('disabled','true');
						$('#btn-approve').hide();
						$('#btn-assign').hide();
					break;
					case 'Pending':
						$('#select_pt').removeAttr('disabled');
						$('#btn-approve').hide();
						$('#btn-assign').show();
					break;
				}
			}
		});

		$(document).on('click', '#btn-patientinfo-details', function(event) {
			$('#data_index').modal('hide');
			$('#patientinfo-details').modal('show');
		});

		$(document).on('click', '#view_patient_info', function(event) {
			$('#data_index').modal('hide');
			$('#patient_info').modal('show');
		});

		$(document).on('click', '#back_patient_info', function(event) {
			$('#data_index').modal('show');
			$('#patient_info').modal('hide');
		});



		var data=[
			{ id:0,tag:'PT Test1'},
			{id:1,tag:'PT Test2'},
			{id:2,tag:'PT Test3'},
			{id:3,tag:'PT Test4'},
			{id:4,tag:'PT Test5'}
			];

		function format(item) { return item.tag; }
		 
		$("#select_pt").select2({
			data:{ results: data, text: 'tag' },
			formatSelection: format,
			formatResult: format,
			allowClear: true,
			placeholder: 'Select a PT'
		});

	}
}