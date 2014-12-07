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
			'user.validate': function(){
				return true;
			}
		}
	},
	'patient_info': {
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