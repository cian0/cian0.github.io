app.modules.test = {

	init: function(vars, req){

		if(req){
			console.log(req);
		}

		vs.setVarsByControllerID('template', {
			title: 'This is a test page',
			theme_color: 'blue',
			main_css_path: 'app/pages/test.css'
		});

		$('#my_button').on('click', function(){
			console.log('I am being called');

			var apiCalled = 'user.logout';
			var useCase = 0; // use this as additional switching for different use cases of api.
			var headers = {};
			var args = {};
			var response = {};
			var type = "POST";

			switch (apiCalled) {
				case 'authenticateUser ' : 
					if (useCase == 0) {
						args = {
							"username" : 'admin', //6a7ad819b84f8c9c2cee6d7fac3b0036650ade137814dd5d7c286261c6e0a59f
							"password" : '123qweasdzxc',
							"usertype" : 'admin'
						};
					} else {
						args = {
							"username" : 'someUsername', //7241d415a117367e9411091a993ba5c9351680f1cbe05250a6cbe51374c0c858
							"password" : 'p@$$w0rd',
							"usertype" : 'web_md'
						};
					}
					
				break;

				case 'createUser' : 
					args = {
					    "username" : "someUsername",
					    "password" : "p@$$w0rd",
					    "passcode" : "d05871-35", // make sure this is a valid passcode for this usertype.
					    "usertype" : "web_md", // check user type with passcode.
					    "email" : "myemail@yahoo.com",
					    "first_name" : "Juan", 
					    "last_name" : "De Mesa",
					    "mi" : "A",
					    "address" : "138 Santol St., San Antonio Village",
					    "city_id" : "2",
					    "contact_no" : "02 823 - 68 -54"
					};
				break;

				case 'user.logout' : 
					args = {};
					
					headers = {
						'X-Auth-Token' : 'b1b27d0cacb2fd33eaaca3273d14da4a0d0aa2c20cd96b73b4fe5fdf95d4bfc' // you may get a valid authtoken from user validation
					};
				break;

				case 'provinces' : 
					args = {};
					headers = {};
					type = "GET";
				break;

				case 'fetchPTs' : 
					args = {};
					headers = {
						'X-Auth-Token' : 'b1b072c06dedaf0201935bdc61692a9864de0fa620e71caf9a3e2ce23f68c850' // should be valid from MD
					};
				break;

				case 'fetchPatientInfo' : 
					args = {
						"page" : "1",
					    "num_per_page" : "10", // numPerPage
					    "order_by" : ["type", "patient_name", "created_at", "updated_at", "assignee", "status"], // orderBy
					    "filter" : "Maria"
					};
					headers = {
						'X-Auth-Token' : 'b1b072c06dedaf0201935bdc61692a9864de0fa620e71caf9a3e2ce23f68c850' // should be valid from MD
					};
				break;

				case 'fetchPatientInfoDetails' : 
					args = 
						{
						    "patient_info_id" : "1"
						};
					
					headers = {
						'X-Auth-Token' : 'b1b072c06dedaf0201935bdc61692a9864de0fa620e71caf9a3e2ce23f68c850' // should be valid from MD
					};
				break;

				case 'assignPatientInformation' : 
					args = 
						{
						    "patient_info_id" : "1",
						    "web_pt_id" : "2"
						};

					headers = {
						'X-Auth-Token' : 'b1b072c06dedaf0201935bdc61692a9864de0fa620e71caf9a3e2ce23f68c850' // should be valid from MD
					};
				break;

				case 'fetchEvaluationFormDetails' : 
					args = 
						{
						    "patientInfoId" : "1"
						};
					
					headers = {
						'X-Auth-Token' : 'b1b072c06dedaf0201935bdc61692a9864de0fa620e71caf9a3e2ce23f68c850' // should be valid from MD
					};
				break;

				case 'updateEvaluationFormDetails' : 

					args = {
						    "patient_info_id" : "1",
						     "details" : [{
						            "id" : "blood_pressure",
						            "title" : "Blood Pressure",
						            "type" : "free_text",
						            "values" : ["Acute"],
						            "order" : "1"
						        },
						        {
						            "id" : "level_of_consciousness",
						            "title" : "Level of Consciousness",
						            "type" : "radio_selection",
						            "values" : ["MRI", "CT Scan"],
						            "order" : "2"
						        }]       

						};
					
					headers = {
						'X-Auth-Token' : 'b1b072c06dedaf0201935bdc61692a9864de0fa620e71caf9a3e2ce23f68c850' // should be valid from MD
					};
				break;

				case 'validateEvaluationForm' : 
					args = {
						    "patient_info_id" : "1"      
						};
					
					headers = {
						'X-Auth-Token' : 'b1b072c06dedaf0201935bdc61692a9864de0fa620e71caf9a3e2ce23f68c850' // should be valid from MD
					};
				break;


				case 'approveEvaluationForm' : 
					args = {
					    "patient_info_id" : "1"      
					};
					
					headers = {
						'X-Auth-Token' : 'b1b072c06dedaf0201935bdc61692a9864de0fa620e71caf9a3e2ce23f68c850' // should be valid from MD
					};
				break;	
			}
			console.log('sending args: ' + JSON.stringify(args));
			response = api.get(apiCalled, args, headers, type);
			
			console.log(JSON.stringify(response));

			/************************************
			************************************
				response handing 
			************************************
			************************************/
			switch (apiCalled) {
				case 'authenticateUser' : 
					console.log('Response code is : ' + response.response.code);
					console.log('Response message is : ' + response.response.message);
				break;

				case 'createUser' : 
					console.log('Response code is : ' + response.response.code);
					console.log('Response message is : ' + response.response.message);
				break;

				case 'user.logout' : 
					console.log('Response code is : ' + response.response.code);
					console.log('Response message is : ' + response.response.message);
				break;

				case 'provinces' : 
					for (var i = 0; i < response.length; i++) {
						console.log('Province ID: ' + response[i].id);
						console.log('Province Name: ' + response[i].name);
						for (var j = 0; j < response[i].cities.length ; j++) {
							console.log('------ City id: ' + response[i].cities[j].id);
							console.log('------ City name: ' + response[i].cities[j].name);
						}
					}
				break;

				case 'fetchPTs':
					console.log('Response code is : ' + response.response.code);
					console.log('Response message is : ' + response.response.message);

					if (response.response.code === '00') {
						for (var i = 0; i < response.ptList.length; i++) {
							var pt = response.ptList[i];

							var ptName = pt.name;
							var ptId = pt.id;

							console.log('PT ID: ' + pt.id);
							console.log('PT Name: ' + pt.name);
						}
					}
				break;

				case 'fetchPatientInfo':
					console.log('Response code is : ' + response.response.code);
					console.log('Response message is : ' + response.response.message);

					if (response.response.code === '00') {

						// {
						//     "response" : {
						//         "code" : "00",
						//         "message" : "Operation successful."
						//     },
						//     "max_pages" : "1", // maxPages
						//     "page": "1",
						//     "patient_info_list" : [ // patientInfoList
						//         {
						//           "patient_id": 1,
						//           "id": 1,
						//           "created_by": {
						//               "id": 4,
						//               "first_name": "Val Allen",
						//               "last_name": "Samonte",
						//               "usertype": "ipad_md"
						//           },
						//           "updated_by": {
						//               "id": 4,
						//               "first_name": "Val Allen",
						//               "last_name": "Samonte",
						//               "usertype": "ipad_md"
						//           },
						//           "assignee": null,
						//           "clinical_diagnosis": "PAD",
						//           "consent": "false",
						//           "therakinetics": "true",
						//           "status": "Pending",
						//           "created_at": "01/04/2015 01:52",
						//           "updated_at": "01/04/2015 01:52",
						//           "validation_counter": 0,
						//           "max_validation_count": 1
						//         }
						//     ]
						// }


						var maxPages = response.max_pages;
						var page = response.page;
						
						for (var i = 0; i < response.patient_info_list.length; i++) {
							var patientInfo = response.patient_info_list[i];

							var patientId = patientInfo.patient_id;
							var id = patientInfo.id;

							var createdBy = patientInfo.created_by;
							var createdById = createdBy.id;
							var createdByFirstName = createdBy.first_name;
							var createdByLastName = createdBy.last_name;
							var createdByUserType = createdBy.usertype;
							
							var updatedBy = patientInfo.updated_by;
							var updatedById = updatedBy.id;
							var updatedByFirstName = updatedBy.first_name;
							var updatedByLastName = updatedBy.last_name;
							var updatedByUserType = updatedBy.usertype;

							var assignee = patientInfo.assignee;
							var clinicalDiagnosis = patientInfo.clinical_diagnosis;
							var consent = patientInfo.consent;
							var therakinetics = patientInfo.therakinetics;
							var status = patientInfo.status;
							var createdAt = patientInfo.created_at;
							var updatedAt = patientInfo.updated_at;
							var validationCounter = patientInfo.validation_counter;
							var maxValidationCount = patientInfo.max_validation_count;

							console.log('Patient info: ' + JSON.stringify(patientInfo));
						}
					}
				break;

				case 'fetchPatientInfoDetails' : 
					console.log('Response code is : ' + response.response.code);
					console.log('Response message is : ' + response.response.message);

					/*
						{
						    "patientInfo": [
						        {
						            "patient_id": "7",
						            "id": "4",
						            "created_by": "6",
						            "updated_by": "6",
						            "assignee": null,
						            "clinical_diagnosis": "PAD",
						            "consent": "true",
						            "therakinetics": "true",
						            "status": "Pending",
						            "created_at": "01/04/2015 09:28",
						            "updated_at": "01/04/2015 09:28",
						            "validation_counter": "0",
						            "max_validation_count": "1",
						            "patient": {
						                "id": "7",
						                "first_name": "Jon Dane",
						                "last_name": "Castro",
						                "gender": "M",
						                "mi": "S",
						                "address": "LP",
						                "mobile_number": "",
						                "area_code": "02",
						                "landline": "8715888",
						                "created_at": "2015-01-04 09:28:37",
						                "updated_at": "2015-01-04 09:28:37"
						            },
						            "details": [
						                {
						                    "patient_info_id": "4",
						                    "id": "PAD_AS",
						                    "title": "ABI Score",
						                    "type": "radio_selection",
						                    "values": [
						                        "Not Applicable"
						                    ],
						                    "order": "2"
						                },
						                {
						                    "patient_info_id": "4",
						                    "id": "PAD_CTD",
						                    "title": "Duration of Cilostazol Treatment",
						                    "type": "radio_selection",
						                    "values": [
						                        "Less than 1 month"
						                    ],
						                    "order": "4"
						                }
						            ]
						        }
						    ],
						    "response": {
						        "code": "00",
						        "message": "Success."
						    }
						}
					*/
					if (response.response.code === '00') {
						var maxPages = response.max_pages;
						var page = response.page;
						
						var patientInfo = response.patientInfo;

						var patientId = patientInfo.patient_id;
						var id = patientInfo.id;

						var createdBy = patientInfo.created_by;
						
						var updatedBy = patientInfo.updated_by;

						var assignee = patientInfo.assignee;
						var clinicalDiagnosis = patientInfo.clinical_diagnosis;
						var consent = patientInfo.consent;
						var therakinetics = patientInfo.therakinetics;
						var status = patientInfo.status;
						var createdAt = patientInfo.created_at;
						var updatedAt = patientInfo.updated_at;
						var validationCounter = patientInfo.validation_counter;
						var maxValidationCount = patientInfo.max_validation_count;

						console.log('Patient info: ' + JSON.stringify(patientInfo));
						
					}

				break;

				case 'assignPatientInformation' : 
					console.log('Response code is : ' + response.response.code);
					console.log('Response message is : ' + response.response.message);
				break;
				
				case 'fetchEvaluationFormDetails' : 
					console.log('Response code is : ' + response.response.code);
					console.log('Response message is : ' + response.response.message);

					if (response.response.code === '00') {
						var evaluationForm = response.evaluationForm;

						var clinicalDiagnosis = evaluationForm.clinicalDiagnosis;
						var details = evaluationForm.details;

						for (var i = 0; i < details.length; i++) {
							var detail = details[i];

							var id = detail.id;
							var title = detail.title;
							var type = detail.type;
							var values = detail.values;
							var order = detail.order;

							console.log('Patient info: ' + JSON.stringify(detail));
						}
					}
				break;

				case 'updateEvaluationFormDetails' : 
					console.log('Response code is : ' + response.response.code);
					console.log('Response message is : ' + response.response.message);
				break;

				case 'validateEvaluationForm' : 
					console.log('Response code is : ' + response.response.code);
					console.log('Response message is : ' + response.response.message);
				break;

				case 'approveEvaluationForm' : 
					console.log('Response code is : ' + response.response.code);
					console.log('Response message is : ' + response.response.message);
				break;

				

			}

			

		});

	}
}