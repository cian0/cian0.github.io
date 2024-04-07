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
				var user_type = $.cookie('user_type');


				
				switch(user_type){
					case 'md':
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
						"updated_at": "", // lastUpdated
						"updated_by": "",
						"assignee": "",
						"status": "Pending",
						"patient_info_id" : "0" // patientInfoID
						},
						{
						"clinical_diagnosis": "Stroke",
						"patient_name": "Arellano, Emman C.",
						"created_at": "11/18/2014 09:33",
						"updated_at": "",
						"updated_by": "",
						"assignee": "",
						"status": "Pending",
						"patient_info_id" : "1"
						},
						{
						"clinical_diagnosis": "PAD",
						"patient_name": "Pagsanjan, Tom L.",
						"created_at": "10/27/2014 09:33",
						"updated_at": "10/29/2014 20:02",
						"updated_by": "Albares, Kim A.",
						"assignee": "El Dorado, Patricia D.",
						"status": "For Approval",
						"patient_info_id" : "1"
						},
						{
						"clinical_diagnosis": "PAD",
						"patient_name": "Marasigan, Tess C.",
						"created_at": "10/27/2014 09:33",
						"updated_at": "10/29/2014 20:02",
						"updated_by": "Punzalan, Dory A.",
						"assignee": "Punzalan, Maria Jennifer A.",
						"status": "Validated",
						"patient_info_id" : "1"
						},
						{
						"clinical_diagnosis": "PAD",
						"patient_name": "Lubao, Molie M.",
						"created_at": "10/27/2014 09:33",
						"updated_at": "10/29/2014 20:02",
						"updated_by": "Marasigan, Michel F.",
						"assignee": "Ilagan, Jomar D.",
						"status": "For Validation",
						"patient_info_id" : "1"
						},
						{
						"clinical_diagnosis": "PAD",
						"patient_name": "Palawan, Tito A.",
						"created_at": "05/04/2014 09:33",
						"updated_at": "07/29/2014 20:02",
						"updated_by": "Barrio, Emman S.",
						"assignee": "Tenorio, Christine D.",
						"status": "Submitted",
						"patient_info_id" : "1"
						},
						{
						"clinical_diagnosis": "PAD",
						"patient_name": "Cruz, Luzviminda D.",
						"created_at": "01/27/2014 09:33",
						"updated_at": "01/30/2014 10:49",
						"updated_by": "Martel, Chrisostomo B.",
						"assignee": "Martel, Chrisostomo B.",
						"status": "Assigned",
						"patient_info_id" : "1"
						}
						]
					});
					break;
					case 'pt':
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
						"patient_name": "Pagsanjan, Tom L.",
						"created_at": "10/27/2014 09:33",
						"updated_at": "10/29/2014 20:02",
						"updated_by": "Albares, Kim A.",
						"assignee": "Punzalan, Maria Jennifer D.",
						"status": "For Approval",
						"patient_info_id" : "1"
						},
						{
						"clinical_diagnosis": "PAD",
						"patient_name": "Marasigan, Tess C.",
						"created_at": "10/27/2014 09:33",
						"updated_at": "10/29/2014 20:02",
						"updated_by": "Punzalan, Dory A.",
						"assignee": "Punzalan, Maria Jennifer A.",
						"status": "Validated",
						"patient_info_id" : "1"
						},
						{
						"clinical_diagnosis": "PAD",
						"patient_name": "Lubao, Molie M.",
						"created_at": "10/27/2014 09:33",
						"updated_at": "10/29/2014 20:02",
						"updated_by": "Marasigan, Michel F.",
						"assignee": "Punzalan, Maria Jennifer D.",
						"status": "For Validation",
						"patient_info_id" : "1"
						},
						{
						"clinical_diagnosis": "PAD",
						"patient_name": "Palawan, Tito A.",
						"created_at": "05/04/2014 09:33",
						"updated_at": "07/29/2014 20:02",
						"updated_by": "Barrio, Emman S.",
						"assignee": "Punzalan, Maria Jennifer D.",
						"status": "Submitted",
						"patient_info_id" : "1"
						},
						{
						"clinical_diagnosis": "PAD",
						"patient_name": "Cruz, Luzviminda D.",
						"created_at": "01/27/2014 09:33",
						"updated_at": "01/30/2014 10:49",
						"updated_by": "Martel, Chrisostomo B.",
						"assignee": "Martel, Chrisostomo B.",
						"status": "Assigned",
						"patient_info_id" : "1"
						}
						]
					});
					break;
				}
				

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
					"clinicalDiagnosis" : "Stroke",
					"therakinetics" : "true",
					"details" : [
					{
					"title" : "Diagnostic Test",
					"type" : "check_box_selection", //free_text/radio_selection/check_box_selection.
					"values" : ["MRI", "CT Scan"],
					"order" : "1"
					},
					{
					"title" : "Modified Rankin Scale",
					"type" : "radio_selection",
					"values" : ["5 - Severe disability. Requires constant nursing care and attention, bedridden, incontinent."],
					"order" : "2"
					},
					{
					"title" : "Disabled",
					"type" : "radio_selection", //free_text/radio_selection/check_box_selection.
					"values" : ["Yes"],
					"order" : "3"
					},
					{
					"title" : "HemiParesis",
					"type" : "radio_selection",
					"values" : ["Left"],
					"order" : "4"
					},
					{
					"title" : "Hemi Sensory Loss",
					"type" : "radio_selection",
					"values" : ["Left"],
					"order" : "5"
					},
					{
					"title" : "Precautions",
					"type" : "free_text",
					"values" : ["Requires constant nursing."],
					"order" : "6"
					},
					{
					"title" : "Recommended for PT services?",
					"type" : "radio_selection",
					"values" : ["Yes"],
					"order" : "7"
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
	'initial_evaluation_form_pad': {
		events: {
			'fetchEvaluationFormDetails': function(){
				var d = false;
				var sampleResponse = [];

				if (d)
					sampleResponse.push({"response":{"code":"00","message":"Operation successful."},"clinical_diagnosis":"PAD","patient_info":{"patient_name":"Icasiano, Cyril Ian A","age":"23","gender":"m","date_of_birth":"10/27/1988","contact_number":"10/27/1988","civil_status":"10/27/1988","address":"Sampaguita St, Marimar Village","date_of_first_visit":"11/07/2014","pt_name":"Marasigan, Marco","referring_doctor":"Del Barrio, Maria"},"initial_evaluation_form":{"id":"0","details":[{"id":"medications","title":"Medications","type":"dynamic_list","values":["Medicine|Dosage|Frequency"],"order":"1"},{"id":"claudication_pain_scale","title":"Claudication Pain Scale","type":"radio_selection","values":["Moderate Pain"],"order":"2"},{"id":"predicted_distance_walk","title":"Predicted Distance Walk","type":"static_list","values":["id|Label|Value|Unit of measurement","pred_dist_walk_ft|Predicted Distance Walk|1|feet","pred_dist_walk_tm|Time|1|hours"],"order":"3"},{"id":"manual_muscle_testing_upper","title":"Manual Muscle Testing - Upper Extremities","type":"static_list","values":["id|Upper Extremities|Value","shoulder_flexors|Shoulder Flexors|","shoulder_abductors|Shoulder Abductors|","sh_int_rot|Shoulder Internal Rotation|","sh_ext_rot|Shoulder External Rotation|","wrist_flexors|Wrist Flexors|","wrist_extensors|Wrist Extensors|"],"order":"4"},{"id":"manual_muscle_testing_lower","title":"Manual Muscle Testing - Lower Extremities","type":"static_list","values":["id|Lower Extremities|Value","hip_flx|Hip Flexors|","hip_abd|Hip Abductors|","hip_int_rot|Hip Internal Rotation|","hip_ext_rot|Hip External Rotation|","knee_flx|Knee Flexors|","knee_ext|Knee Extensors|","ank_dor|Ankle Dorsiflexors|","ank_pla|Ankle Plantarflexors|"],"order":"5"},{"id":"standing_balance_and_tolerance_test","title":"Standing Balance and Tolerance Test","type":"static_list","values":["id|Key|Value","bal|Balance|","tol|Tolerance|"],"order":"6"},{"id":"gait_analysis_stance_phase","title":"Gait Analysis - Stance Phase","type":"static_list","values":["id|Stance Phase|Left|Right","hl_str|Heel Strike|no|no","ft_flt|Foot Flat|no|no","mid_sta|Mid Stance|no|no","hl_off|Heel Off|no|no","toe_off|Toe Off|no|no"],"order":"7"},{"id":"gait_analysis_swing_phase","title":"Gait Analysis - Swing Phase","type":"static_list","values":["id|Swing Phase|Left|Right","acc|Acceleration|no|no","mild_sw|Mild Swing|no|no","dec|Deceleration|no|no"],"order":"8"},{"id":"gait_analysis_misc","title":"Gait Analysis - Misc Details","type":"static_list","values":["id|Key|Value","cad|Cadence (/min)|0","str_len|Stride Length (/min)|0","stp_len_l|Step Length (left)|0","stp_len_r|Step Legnth (right)|0"],"order":"9"},{"id":"assessment","title":"Assessment","type":"free_text","values":["This is the PT's assessment."],"order":"10"},{"id":"plan","title":"Plan","type":"static_list","values":["id|Key|Value","tpw|Times per week|1","nos|Number of sessions|1"],"order":"11"},{"id":"goals","title":"Goals","type":"free_text","values":["This is the PT's goals for the patient."],"order":"12"},{"id":"prc_license_number","title":"PRC License Number","type":"free_text","values":["This is the PT's license number."],"order":"13","optional":"true"},{"id":"pt_contact_number","title":"Contact Number","type":"free_text","values":["This is the PT's contact number."],"order":"14","optional":"true"}]},"final_evaluation_form":{"id":"1","details":[{"id":"medications","title":"Medications","type":"dynamic_list","values":["Medicine|Dosage|Frequency","Medicine Name|500g|2x a day","Another Medicine Name|50g|3x a day","Another Medicine|8g|2x a day"],"order":"1"},{"id":"claudication_pain_scale","title":"Claudication Pain Scale","type":"radio_selection","values":["Moderate Pain"],"order":"2"},{"id":"predicted_distance_walk","title":"Predicted Distance Walk","type":"static_list","values":["id|Label|Quantity|Unit of measurement","pred_dist_walk_ft|Predicted Distance Walk|1|feet","pred_dist_walk_tm|Time|1|hours"],"order":"3"},{"id":"manual_muscle_testing_upper","title":"Manual Muscle Testing - Upper Extremities","type":"static_list","values":["id|Upper Extremities|Value","shoulder_flexors|Shoulder Flexors|1","shoulder_abductors|Shoulder Abductors|3","sh_int_rot|Shoulder Internal Rotation|2","sh_ext_rot|Shoulder External Rotation|4","wrist_flexors|Wrist Flexors|4","wrist_extensors|Wrist Extensors|5"],"order":"4"},{"id":"manual_muscle_testing_lower","title":"Manual Muscle Testing - Lower Extremities","type":"static_list","values":["id|Lower Extremities|Value","hip_flx|Hip Flexors|","hip_abd|Hip Abductors|","hip_int_rot|Hip Internal Rotation|","hip_ext_rot|Hip External Rotation|4","knee_flx|Knee Flexors|4","knee_ext|Knee Extensors|5","ank_dor|Ankle Dorsiflexors|5","ank_pla|Ankle Plantarflexors|5"],"order":"5"},{"id":"standing_balance_and_tolerance_test","title":"Standing Balance and Tolerance Test","type":"static_list","values":["id|Key|Value","bal|Balance|","tol|Tolerance|"],"order":"6"},{"id":"gait_analysis_stance_phase","title":"Gait Analysis - Stance Phase","type":"static_list","values":["id|Stance Phase|Left|Right","hl_str|Heel Strike|no|no","ft_flt|Foot Flat|no|no","mid_sta|Mid Stance|no|no","hl_off|Heel Off|no|no","toe_off|Toe Off|no|no"],"order":"7"},{"id":"gait_analysis_swing_phase","title":"Gait Analysis - Swing Phase","type":"static_list","values":["id|Swing Phase|Left|Right","acc|Acceleration|no|no","mild_sw|Mild Swing|no|no","dec|Deceleration|no|no"],"order":"8"},{"id":"gait_analysis_misc","title":"Gait Analysis - Misc Details","type":"static_list","values":["id|Key|Value","cad|Cadence (/min)|0","str_len|Stride Length (/min)|0","stp_len_l|Step Length (left)|0","stp_len_r|Step Legnth (right)|0"],"order":"9"},{"id":"walking_distance_and_speed","title":"Walking Distance & Speed","type":"static_list","values":["id|Session|Date|Distance (feet)|Time of Onset of Pain (mins)|Speed (feet/min)","wds1|1st||0|0|0","wds2|2nd||0|0|0","wds3|3rd||0|0|0","wds4|4th||0|0|0","wds5|5th||0|0|0"],"order":"10"},{"id":"findings","title":"Findings","type":"free_text","values":["This is the PT's findings."],"order":"11"},{"id":"pt_impression","title":"PT Impression","type":"free_text","values":["This is the PT's goals for the patient."],"order":"12"},{"id":"prc_license_number","title":"PRC License Number","type":"free_text","values":["This is the PT's license number."],"order":"13","optional":"true"},{"id":"pt_contact_number","title":"Contact Number","type":"free_text","values":["This is the PT's contact number."],"order":"14","optional":"true"}]}});
				else
					sampleResponse.push({"response":{"code":"00","message":"Operation successful."},"clinical_diagnosis":"PAD","patient_info":{"patient_name":"Icasiano, Cyril Ian A","age":"23","gender":"m","date_of_birth":"10/27/1988","contact_number":"10/27/1988","civil_status":"10/27/1988","address":"Sampaguita St, Marimar Village","date_of_first_visit":"11/07/2014","pt_name":"Marasigan, Marco","referring_doctor":"Del Barrio, Maria"},"initial_evaluation_form":{"id":"0","details":[{"id":"medications","title":"Medications","type":"dynamic_list","values":["Medicine|Dosage|Frequency","Medicine Name|500g|2x a day","Another Medicine Name|50g|3x a day","Another Medicine|8g|2x a day"],"order":"1"},{"id":"claudication_pain_scale","title":"Claudication Pain Scale","type":"radio_selection","values":["Moderate Pain"],"order":"2"},{"id":"predicted_distance_walk","title":"Predicted Distance Walk","type":"static_list","values":["id|Label|Value|Unit of measurement","pred_dist_walk_ft|Predicted Distance Walk|1|feet","pred_dist_walk_tm|Time|1|hours"],"order":"3"},{"id":"manual_muscle_testing_upper","title":"Manual Muscle Testing - Upper Extremities","type":"static_list","values":["id|Upper Extremities|Value","shoulder_flexors|Shoulder Flexors|1","shoulder_abductors|Shoulder Abductors|3","sh_int_rot|Shoulder Internal Rotation|2","sh_ext_rot|Shoulder External Rotation|4","wrist_flexors|Wrist Flexors|4","wrist_extensors|Wrist Extensors|5"],"order":"4"},{"id":"manual_muscle_testing_lower","title":"Manual Muscle Testing - Lower Extremities","type":"static_list","values":["id|Lower Extremities|Value","hip_flx|Hip Flexors|1","hip_abd|Hip Abductors|3","hip_int_rot|Hip Internal Rotation|2","hip_ext_rot|Hip External Rotation|4","knee_flx|Knee Flexors|4","knee_ext|Knee Extensors|5","ank_dor|Ankle Dorsiflexors|5","ank_pla|Ankle Plantarflexors|5"],"order":"5"},{"id":"standing_balance_and_tolerance_test","title":"Standing Balance and Tolerance Test","type":"static_list","values":["id|Key|Value","bal|Balance|Poor","tol|Tolerance|Poor"],"order":"6"},{"id":"gait_analysis_stance_phase","title":"Gait Analysis - Stance Phase","type":"static_list","values":["id|Stance Phase|Left|Right","hl_str|Heel Strike|no|no","ft_flt|Foot Flat|no|no","mid_sta|Mid Stance|yes|no","hl_off|Heel Off|no|yes","toe_off|Toe Off|yes|no"],"order":"7"},{"id":"gait_analysis_swing_phase","title":"Gait Analysis - Swing Phase","type":"static_list","values":["id|Swing Phase|Left|Right","acc|Acceleration|no|no","mild_sw|Mild Swing|no|no","dec|Deceleration|yes|no"],"order":"8"},{"id":"gait_analysis_misc","title":"Gait Analysis - Misc Details","type":"static_list","values":["id|Key|Value","cad|Cadence (/min)|0","str_len|Stride Length (/min)|0","stp_len_l|Step Length (left)|0","stp_len_r|Step Legnth (right)|0"],"order":"9"},{"id":"assessment","title":"Assessment","type":"free_text","values":["This is the PT's assessment."],"order":"10"},{"id":"plan","title":"Plan","type":"static_list","values":["id|Key|Value","tpw|Times per week|1","nos|Number of sessions|1"],"order":"11"},{"id":"goals","title":"Goals","type":"free_text","values":["This is the PT's goals for the patient."],"order":"12"},{"id":"prc_license_number","title":"PRC License Number","type":"free_text","values":["This is the PT's license number."],"order":"13","optional":"true"},{"id":"pt_contact_number","title":"Contact Number","type":"free_text","values":["This is the PT's contact number."],"order":"14","optional":"true"}]},"final_evaluation_form":{"id":"1","details":[{"id":"medications","title":"Medications","type":"dynamic_list","values":["Medicine|Dosage|Frequency","Medicine Name|500g|2x a day","Another Medicine Name|50g|3x a day","Another Medicine|8g|2x a day"],"order":"1"},{"id":"claudication_pain_scale","title":"Claudication Pain Scale","type":"radio_selection","values":["Moderate Pain"],"order":"2"},{"id":"predicted_distance_walk","title":"Predicted Distance Walk","type":"static_list","values":["id|Label|Value|Unit of measurement","pred_dist_walk_ft|Predicted Distance Walk|1|feet","pred_dist_walk_tm|Time|1|hours"],"order":"3"},{"id":"manual_muscle_testing_upper","title":"Manual Muscle Testing - Upper Extremities","type":"static_list","values":["id|Upper Extremities|Value","shoulder_flexors|Shoulder Flexors|1","shoulder_abductors|Shoulder Abductors|3","sh_int_rot|Shoulder Internal Rotation|2","sh_ext_rot|Shoulder External Rotation|4","wrist_flexors|Wrist Flexors|4","wrist_extensors|Wrist Extensors|5"],"order":"4"},{"id":"manual_muscle_testing_lower","title":"Manual Muscle Testing - Lower Extremities","type":"static_list","values":["id|Lower Extremities|Value","hip_flx|Hip Flexors|1","hip_abd|Hip Abductors|3","hip_int_rot|Hip Internal Rotation|2","hip_ext_rot|Hip External Rotation|4","knee_flx|Knee Flexors|4","knee_ext|Knee Extensors|5","ank_dor|Ankle Dorsiflexors|5","ank_pla|Ankle Plantarflexors|5"],"order":"5"},{"id":"standing_balance_and_tolerance_test","title":"Standing Balance and Tolerance Test","type":"static_list","values":["id|Key|Value","bal|Balance|Poor","tol|Tolerance|Poor"],"order":"6"},{"id":"gait_analysis_stance_phase","title":"Gait Analysis - Stance Phase","type":"static_list","values":["id|Stance Phase|Left|Right","hl_str|Heel Strike|no|no","ft_flt|Foot Flat|no|no","mid_sta|Mid Stance|yes|no","hl_off|Heel Off|no|yes","toe_off|Toe Off|yes|no"],"order":"7"},{"id":"gait_analysis_swing_phase","title":"Gait Analysis - Swing Phase","type":"static_list","values":["id|Swing Phase|Left|Right","acc|Acceleration|no|no","mild_sw|Mild Swing|no|no","dec|Deceleration|yes|no"],"order":"8"},{"id":"gait_analysis_misc","title":"Gait Analysis - Misc Details","type":"static_list","values":["id|Key|Value","cad|Cadence (/min)|0","str_len|Stride Length (/min)|0","stp_len_l|Step Length (left)|0","stp_len_r|Step Legnth (right)|0"],"order":"9"},{"id":"walking_distance_and_speed","title":"Walking Distance & Speed","type":"static_list","values":["id|Session|Date|Distance (feet)|Time of Onset of Pain (mins)|Speed (feet/min)","wds1|1st|10/23/12|4|2|2","wds2|2nd|10/23/12|4|2|2","wds3|3rd|10/23/12|4|2|2","wds4|4th|10/23/12|4|2|2","wds5|5th|10/23/12|4|2|2"],"order":"10"},{"id":"findings","title":"Findings","type":"free_text","values":["This is the PT's findings."],"order":"11"},{"id":"pt_impression","title":"PT Impression","type":"free_text","values":["This is the PT's goals for the patient."],"order":"12"},{"id":"prc_license_number","title":"PRC License Number","type":"free_text","values":["This is the PT's license number."],"order":"13","optional":"true"},{"id":"pt_contact_number","title":"Contact Number","type":"free_text","values":["This is the PT's contact number."],"order":"14","optional":"true"}]}});
				
				var choice = vs.developer.createTestResponsePicker(sampleResponse, "fetchEvaluationFormDetails");

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