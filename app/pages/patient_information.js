app.modules.patient_information = {

	init: function(vars){
		vs.setVarByControllerID('template','title','Patient Information - PT');

		$('#patientinfo').bootstrapTable({
			url: 'https://api.myjson.com/bins/2mbej',
			striped: true,
			pagination: true,
			search: true,
			height: '600',
			sortable: true,
			sortorder: 'desc'
		});

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
			$('#data_index').modal('show');
		});

		$(document).on('click', '#btn-patientinfo-details', function(event) {
			$('#data_index').modal('hide');
			$('#patientinfo-details').modal('show');
		});

		$(document).on('click', '#btn-initial-evaluation-form', function(event) {
			$('#data_index').modal('hide');	
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