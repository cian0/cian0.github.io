$(document).ready(function () {

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
		$('#data_index').modal({
				show: true,
				keyboard: false,
				backdrop: 'static'
			});
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

});
