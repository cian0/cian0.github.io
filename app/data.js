/* App Data */
app.data = angular.module('App', []);

app.data.controller('template', function ($scope){
  $scope.title 		= "";
  $scope.theme_color = 'blue';
  $scope.main_css_path = '';
});

app.data.controller('my_testing', function ($scope){
  $scope.test  = "test@test.com";
});

app.data.controller('login', function ($scope){
  $scope.username 		= "test@test.com";
  $scope.password 		= "mypass";
  $scope.theme_color 	= "";
  $scope.user_type   = "";
});

app.data.controller('register', function ($scope){
  $scope.user_type  = "";
  $scope.cities     = [];
  $scope.username  = "";
  $scope.password  = "";
  $scope.password_confirm = "";
  $scope.passcode  = "";
  $scope.usertype  = "";
  $scope.email  = "";
  $scope.first_name  = "";
  $scope.last_name  = "";
  $scope.mi  = "";
  $scope.address  = "";
  $scope.city_id  = "";
  $scope.contact_no  = "";
});


app.data.controller('md_login', function ($scope){
});

app.data.controller('md_register', function ($scope){
});

app.data.controller('pt_login', function ($scope){
});

app.data.controller('pt_register', function ($scope){
});

app.data.controller('test', function ($scope){
  $scope.test  = Math.random();
});

app.data.controller('patient_information', function ($scope){
  $scope.name  = "Test";
  $scope.theme_color 	= "red";
  $scope.ptinfo_type 	= "fetching...";
  $scope.ptinfo_name 	= "fetching...";
  $scope.ptinfo_date_received 	= "fetching...";
  $scope.ptinfo_last_updated 	= "fetching...";
  $scope.ptinfo_updated_by 	= "fetching...";
  $scope.user_type  = "";

  $scope.ptdetails = {
    "profile" : {
      "firstname" : null,
      "lastname" : null,
      "mi" : null,
      "address" : "4857 Sampaguita st. Sto Cristo",
      "mobileNumber" : "9175051599",
      "areaCode" : "02",
      "landline" : "8236852"
    },
    "clinicalDiagnosis" : "PAD",
    "therakinetics" : "true",
    "details" : [
      {
        "title" : "Stroke Duration",
        "type" : "radio_selection",
        "values" : ["Acute"],
        "order" : "1"
      },
      {
        "title" : "Diagnostic Test",
        "type" : "check_box_selection",
        "values" : ["MRI", "CT Scan"],
        "order" : "2"
      }
    ]
  };
});


app.data.controller('initial_evaluation_form_pad', function ($scope){
  $scope.clinical_diagnosis = "",
  $scope.patient_info = {};
  $scope.initial_evaluation_form = {};
  $scope.final_evaluation_form = {};
});

app.data.controller('initial_evaluation_form', function ($scope){

});