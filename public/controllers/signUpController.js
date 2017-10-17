angular.module("KnowItAll").controller('signUpController', ['$scope', '$http', '$window', '$cookies', function($scope, $http, $window, $cookies) {
    
    console.log("logging from signup controller");


    $scope.signupFunction = function () {
    	console.log("In get query function, username: " + $scope.signupUsername);
    	console.log("in get query, function, passwrd: " + $scope.signupPassword);
    	var passwordHash = $scope.signupPassword.hashCode();
    	var username = $scope.signupUsername;
    	var signupEmail = $scope.signupEmail;
    
		$http.get('/signupFunction?signupUsername=' + username + 
				  "&signupPassword=" + passwordHash +
				  "&signupEmail=" + signupEmail).then(function (response) {
	    	console.log("user received");
	    	//console.log(response.data);
	    	
	    	if(response.data.length == 0){
	    		console.log(response.data);
	    		console.log("user does not exist in database");

	    		$cookies.put("newUsername", username);
	    		$cookies.put("newPasswordHash", passwordHash);

	    		console.log("Sending Email");
	    		$http.get("/sendEmail?newUsername=" + username + 
	    			"&newPasswordHash=" + passwordHash +
	    			"&newEmail=" + signupEmail).then(function (response) {
	    				$scope.signupErrorMessage = "Email sent";
	    			}, 
	    			function (respons) {
	    				console.log("Failed to send email");
	    				$scope.signupErrorMessage = "Failed to send email, invalid address";
	    			}
	    		);
	    	} 
	    	else {
	    		//user exists already
	    		console.log(response.data);
	    		$scope.signupErrorMessage = "The username exists";	
	    	}
	    },
	    function (res) {
	    	console.log("user NOT received");
	    });
 
    }
}]);


