/* App Data */
app.data = angular.module('App', []);

app.data.controller('template', function ($scope){
  $scope.title 		= "";
});

app.data.controller('login', function ($scope){
  $scope.username 		= "test@test.com";
  $scope.password 		= "mypass";
});

app.data.controller('md_login', function ($scope){
  $scope.test1 		= "apple";
  $scope.test2 		= "banana";
  $scope.test3 		= "grapes";
});

app.data.controller('patient_info', function ($scope){
  $scope.myvar1 		= "1 x apple";
  $scope.myvar2 		= "2 x banana";
  $scope.myvar3 		= "3 x grapes";
});
