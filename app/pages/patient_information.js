app.modules.patient_information = {

	init: function(vars){

		/***Summary of components below***/

		if(checkUserSession()){
			templateVariables();
			bootstrapTable();
			btnPatientInfoDetails();
			btnViewPatientInfo();
			btnBackPatienInfo();
			btnLogout();			
		} else {
			window.location.hash= "#!/login?type=" + $.cookie('user_type') + "&status=need-auth";
		}


		/***Component implementations below***/

		function checkUserSession(){
			if($.cookie('auth_token')){
				return true;
			} else {
				return false;
			}
		}

		function btnApprove(args){

			$('#btn-approve').on({

				click: function(){

					var response = api.get('approveEvaluationForm', {
						"patient_info_id" : args.patient_info_id
					});

					if(response){
						switch(response.response.code){
							case '00':
								app.commons.showDialog({
									body: "Evaluation form has been approved"
								});

								$('#btn-close-patient-info').trigger('click');
							break;
						}
					}
				}
			});
		}

		function btnLogout(){

			$('#btn-logout').on({

				click: function(){
					app.commons.logout();
				}
			});
		}

		function selectPT(args){

			var response = api.get('fetchPTs');

			if(response){
				switch(response.response.code){
					case '00':
						var ptList = response.ptList;

						var data=[];

						for(var i = 0; i < ptList.length; i++){

							data.push({
								id  : ptList[i].id,
								text: ptList[i].name
							});	
						}

						$("#select_pt").select2({
							data: data,
							placeholder: args.assigned_to,
							allowClear: true,
						});

						$("#select_pt").on({
							change: function(e){

								var response = api.get('assignPatientInformation',{
									"patient_info_id" : "1",
									"web_pt_id" : "2"
								});

								if(response){
									switch(response.response.code){
										case '00':
											app.commons.showDialog({
												body: "PT has been assigned."
											});
										break;
									}
								}
							}
						})

					break;
					case '99':
					case '01':
					case '02':
					case '101':
					case '102':
					case '103':
					case '104':					
						app.commons.showDialog({
							body: response.response.message
						})
					break;
				}
			}
		}

		function templateVariables(){

			var user_type = $.cookie('user_type');

			vs.setVarByControllerID('template','title','Patient Information - ' + user_type.toUpperCase());

			var theme_color;

			
			switch(user_type){
				case 'md':
					theme_color = 'blue';
				break;
				case 'pt':
					theme_color = 'red';
				break;
			}



			vs.setVarsByControllerID('template', {
				theme_color: theme_color,
				main_css_path: 'app/pages/patient_information.css'
			});

		

			vs.setVar('theme_color', theme_color);
			vs.setVar('user_type', user_type);
		}
		

		function bootstrapTable(){

			$('#patientinfo').bootstrapTable({
				striped: true,
				pagination: true,
				search: true,
				sortable: true,
				sortorder: 'desc',
                onClickRow: function (row) {
                	tableRow(row);
                }
			});

			var response = api.get('fetchPatientInfo', {
				"page" : "1",
				"num_per_page" : "10", // numPerPage
				"order_by" : ["type", "patient_name", "created_at", "updated_at", "assignee", "status"], // orderBy
				"filter" : "Maria"
			});

			if(response){
				switch(response.response.code){
					case '00':
						var patient_info_list = response.patient_info_list;

						for(var i = 0; i < patient_info_list.length; i++){
							$('#patientinfo').bootstrapTable('append', {
								"padstroke"		: patient_info_list[i]['clinical_diagnosis'],
								"patientname"	: patient_info_list[i]['patient_name'],
								"datereceived"	: patient_info_list[i]['created_at'],
								"lastupdated"	: patient_info_list[i]['updated_at'],
								"updatedby"		: patient_info_list[i]['updated_by'],
								"assignedtopt"	: patient_info_list[i]['assignee'],
								"status"		: patient_info_list[i]['status'],
								"patient_info_id"	: patient_info_list[i]['patient_info_id']
							});						
						}

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
		}

		function btnInitialEvaluationForm(type){

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
		}

		function tableRow(row){
				
			$('#data_index').modal({
				show: true,
				keyboard: false,
				backdrop: 'static'
			});

			vs.setVars({
				ptinfo_type: row.padstroke,
				ptinfo_name: row.patientname,
				ptinfo_date_received: row.datereceived,
				ptinfo_last_updated: row.lastupdated,
				ptinfo_updated_by: row.updatedby
			});

			selectPT({
				assigned_to: row.assignedtopt
			});

			btnApprove({
				patient_info_id: row.patient_info_id
			});

			btnInitialEvaluationForm(row.padstroke);			

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
		}

		function btnPatientInfoDetails(){

			$(document).on('click', '#btn-patientinfo-details', function(event) {
				$('#data_index').modal('hide');
				$('#patientinfo-details').modal('show');
			});			
		}

		function btnViewPatientInfo(){

			$(document).on('click', '#view_patient_info', function(event) {
				$('#data_index').modal('hide');
				$('#patient_info').modal('show');

				var response = api.get('fetchPatientInfoDetails', {
					"authToken" : "a3Asovo9JAql39a",
					"patientInfoId" : "1"
				});

				if(response){
					switch(response.response.code){
						case '00':

							var patient_info_list = response.patientInfo;

							vs.setVarsByControllerID('patient_information', {
								ptdetails: patient_info_list
							});

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
			});
		}

		function btnBackPatienInfo(){

			$(document).on('click', '#back_patient_info', function(event) {
				$('#data_index').modal('show');
				$('#patient_info').modal('hide');
			});
		}
	}
}