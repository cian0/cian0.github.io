/* App Data */
app.tests = {
	'md_login': {
		data:{
			test1: {
				"test1": "asda",
				"test2": "sdff",
				"test3": "dsff"
			},
			test2: {
				"test1": "ggg",
				"test2": "aaa",
				"test3": "qe1"
			}
		}
	},
	'login': {
		data:{
			test1: {
				"test1": "asda",
				"test2": "sdff",
				"test3": "dsff"
			},
			test2: {
				"test1": "ggg",
				"test2": "aaa",
				"test3": "qe1"
			}
		},
		events:{
			'authenticateUser': function(){

				var sampleResponse = [];

				sampleResponse.push({"response":{"code":"00","message":"Authentication successful."},"authToken":"chs3jg7cks8fur0"});

				sampleResponse.push({"response":{"code":"99","message":"There was an unexpected error on the server."}});

				sampleResponse.push({"response":{"code":"01","message":"Invalid input for field: 'email'"}});

				sampleResponse.push({"response":{"code":"02","message":"Missing required field: 'lastname'"}});

				sampleResponse.push({"response":{"code":"201","message":"Username/Password is incorrect."}});

				var choice = vs.developer.createTestResponsePicker(sampleResponse, 'authenticateUser');

				return choice;
			}
		}
	},
	'register': {
		events: {
			'createUser': function(){

				var sampleResponse = [];

				sampleResponse.push({"response":{"code":"00","message":"Operation successful."}});

				sampleResponse.push({"response":{"code":"99","message":"There was an unexpected error on the server."}});

				sampleResponse.push({"response":{"code":"01","message":"Invalid input for field: 'email'"}});

				sampleResponse.push({"response":{"code":"02","message":"Missing required field: 'lastname'"}});

				sampleResponse.push({"response":{"code":"101","message":"Passcode doesn't match user-type."}});

				sampleResponse.push({"response":{"code":"102","message":"Username already in use."}});

				sampleResponse.push({"response":{"code":"103","message":"City not found on database."}});

				sampleResponse.push({"response":{"code":"104","message":"Invalid passcode."}});

				var choice = vs.developer.createTestResponsePicker(sampleResponse, 'createUser');

				return choice;

			}
		}
	},
	'patient_information': {
		events: {
			'approveEvaluationForm': function(){
				var sampleResponse = [];

				sampleResponse.push({
				"response" : {
				"code" : "00",
				"message" : "Operation successful."
				}
				});

				var choice = vs.developer.createTestResponsePicker(sampleResponse, 'destroyAuthToken');

				return choice;
			},
			'destroyAuthToken': function(){

				var sampleResponse = [];

				sampleResponse.push({
				"response" : {
				"code" : "00",
				"message" : "Operation successful."
				}});

				var choice = vs.developer.createTestResponsePicker(sampleResponse, 'destroyAuthToken');

				return choice;
			},
			'fetchPatientInfo': function(){

				var sampleResponse = [];

				sampleResponse.push({
				"response" : {
				"code" : "00",
				"message" : "Operation successful."
				},
				"max_pages" : "1", // maxPages
				"page": "1",
				"patient_info_list" : [ // patientInfoList
				{
				"clinical_diagnosis": "PAD",
				"patient_name": "Del Barrio, Maria C.",
				"created_at": "10/27/2014 09:33", // dateReceived
				"updated_at": "10/29/2014 20:02", // lastUpdated
				"updated_by": "Del Remedio, Michel A.",
				"assignee": "Fuentes, Jerelene D.",
				"status": "Pending",
				"patient_info_id" : "0" // patientInfoID
				},
				{
				"clinical_diagnosis": "PAD",
				"patient_name": "Dacles, Tom C.",
				"created_at": "10/27/2014 09:33",
				"updated_at": "10/29/2014 20:02",
				"updated_by": "Icasiano, Michel A.",
				"assignee": "Punzalan, Maria Jennifer D.",
				"status": "Pending",
				"patient_info_id" : "1"
				}
				]
				});

				var choice = vs.developer.createTestResponsePicker(sampleResponse, 'patients.infolist');

				return choice;
			},
			'fetchPatientInfoDetails': function(){

				var sampleResponse = [];

				sampleResponse.push({
					"response" : {
					"code" : "00",
					"message" : "Operation successful."
					},
					"patientInfo" : {
					"profile" : {
					"firstname" : "Juan",
					"lastname" : "Dela Cruz",
					"mi" : "A",
					"address" : "4857 Sampaguita st. Sto Cristo",
					"mobileNumber" : "9175051599",
					"areaCode" : "02",
					"landline" : "8236852"
					},
					"clinicalDiagnosis" : "PAD",
					"therakinetics" : "true",
					"details" : [{
					"title" : "Stroke Duration",
					"type" : "radio_selection",
					"values" : ["Acute"],
					"order" : "1"
					},
					{
					"title" : "Diagnostic Test",
					"type" : "check_box_selection", //free_text/radio_selection/check_box_selection.
					"values" : ["MRI", "CT Scan"],
					"order" : "2"
					}]
					}
				});

				var choice = vs.developer.createTestResponsePicker(sampleResponse, "fetchPatientInfoDetails");

				return choice;

			},
			'assignPatientInformation': function(){

				var sampleResponse = [];

				sampleResponse.push({
				"response" : {
				"code" : "00",
				"message" : "Operation successful."
				}
				});

				var choice = vs.developer.createTestResponsePicker(sampleResponse, "assignPatientInformation");

				return choice;
			},
			'fetchPTs': function(){

				var sampleResponse = [];

				sampleResponse.push({
				"response" : {
				"code" : "00",
				"message" : "Operation successful."
				},
				"ptList" : [
				{
				"name" : "Doe, John",
				"id" : "0"
				},
				{
				"name" : "Rosario, Maria",
				"id" : "1"
				},
				{
				"name" : "Pundit, Michael Almond",
				"id" : "2"
				}
				]
				});

				var choice = vs.developer.createTestResponsePicker(sampleResponse, "fetchPTs");

				return choice;
			}
		},
		data: {
			test1: {
				"myvar1": "20",
				"myvar2": "30",
				"myvar3": "40"
			},
			test2: {
				"myvar1": "40",
				"myvar2": "50",
				"myvar3": "70"
			}
		}
	},
	'thank_you': {
		data: {
			test1: {
				"datePrefix": "",
				"scheduledDate": "Today",
				"scheduledTime": "2:30pm"
			},
			test2: {
				"datePrefix": "",
				"scheduledDate": "Today",
				"scheduledTime": "3:30pm"
			}
		}
	}
}