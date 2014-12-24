/* App Data */
app.data = angular.module('App', []);

app.data.controller('template', function ($scope){
  $scope.title 		= "";
  $scope.theme_color = 'blue';
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
  $scope.provinces  = [];
});


app.data.controller('md_login', function ($scope){
});

app.data.controller('md_register', function ($scope){
});

app.data.controller('pt_login', function ($scope){
});

app.data.controller('pt_register', function ($scope){
});



app.data.controller('patient_information', function ($scope){
  $scope.theme_color 	= "red";
  $scope.ptinfo_type 	= "fetching...";
  $scope.ptinfo_name 	= "fetching...";
  $scope.ptinfo_date_received 	= "fetching...";
  $scope.ptinfo_last_updated 	= "fetching...";
  $scope.ptinfo_updated_by 	= "fetching...";
  $scope.user_type  = "";
});


app.data.controller('initial_evaluation_form_pad', function ($scope){

});