angular.module("KnowItAll").controller('otherUserProfile', ['$scope', '$http', '$cookies', '$routeParams', '$location', function($scope, $http, $cookies, $routeParams, $location) {

	var otherUsername = $routeParams.username.replace(":", "");
	var currUsername = $cookies.get("username");

	var isLoggedIn = currUsername != "null"; // Because javascript is werid
	$scope.isLoggedIn = isLoggedIn;	
	$scope.otherUsername = otherUsername

	if (isLoggedIn) {

		// feed
		$http.get('/profile?username=' + otherUsername)
			.then(function (response) {
					$scope.questionList = response.data;
					return response.data; 
				}, function (response) {
					console.log("Failed to get current user, not logged in");
			}).then(function(response){ 
				var list = response;
                for(var i=0; i<list.length; i++){
                    var current = list[i]; 
                    // username
                    if(current.isAnonymous == 1) current.username = "anonymous";
                    else getUsername(current);
                    // end date
                    if (current.endDate == null) {
                        current.endDateDisplay = "Open Forever"; 
                    } else {
                        var date = new Date();
                        var finalCloseDate = new Date(current.endDate);
                        if (date < finalCloseDate) { 
                             current.endDateDisplay = "Open until " + convertDay(finalCloseDate) ; 
                        } else { 
                            current.endDateDisplay = "CLOSED"; 
                        }
                    }
                    // tags
                    getTags(current); 
                } // end of for loop
			}
		);

		// bio and imageURL
		$http.get('/getUserInfo?username=' + otherUsername).then(function(response) {
    		var bio = response.data[0].bio; 
    		if(bio) $scope.bio = bio; 
    
    		var imageURL = response.data[0].imageURL; 
    		if(imageURL) $scope.imageURL = imageURL;
    		else $scope.imageURL = "img/blankprofile.png";
		});

		function convertDay(endDate){
	        var month = endDate.getUTCMonth() + 1; 
	        var day = endDate.getUTCDate();
	        var year = endDate.getUTCFullYear();
	        newdate = month + "/" + day + "/" + year;
	        return newdate
	    }

	    function getUsername(current){
	        $http.get('/getUserName?userID=' + current.userID)
	            .then(function (response) {
	                    current.username = response.data[0].username;
	                }, function (response) {
	                    console.log("FAILED getting username");
	            }
	        );
	    }

	    function getTags(current){
	        $http.get('/getQuestionTags?questionID=' + current.questionID)
	            .then(function (response) {
	                    var tags = [];
	                    for(var i=0; i<response.data.length; i++){
	                        tags.push({
	                            tagStr: response.data[i].tagStr
	                        });
	                    }
	                    current.allTags = tags; 
	                }, function (response) {
	                    console.log("FAILED getting tags");
	            }
	        );
	    }

		$http.get('/isFollowing?user1=' + currUsername +
		 "&user2=" + otherUsername).then(function (response) {
		 	if(response.data.length > 0) {
		 		$scope.isFollowing = {bool : true, string : "UNFOLLOW"};
		 	} else {
		 		$scope.isFollowing = {bool : false, string : "FOLLOW"};
		 	}
		 });

		 $http.get('/numFollowers?username=' + otherUsername).then(function (response) {
		 	$scope.numFollowers = {num : response.data[0].numFollowers};
		 });
	}
	
	$scope.toggleFollow = function() {
		var otherUsername = $routeParams.username.replace(":", "");


		if ($scope.isFollowing.bool) {
			$http.get('/unfollow?currUser=' + currUsername + "&userToUnfollow=" + otherUsername);
			$http.get('/notifyFollowing?currUser=' + currUsername + '&userToNotify=' + otherUsername + '&action=unfollow');
			$scope.isFollowing = {bool : false, string : "FOLLOW"};
			$scope.numFollowers = {num : $scope.numFollowers.num - 1};
			console.log($scope.numFollowers.num);
		} else {
			$http.get('/follow?currUser=' + currUsername + "&userToFollow=" + otherUsername);
			$http.get('/notifyFollowing?currUser=' + currUsername + '&userToNotify=' + otherUsername + '&action=follow');
			$scope.isFollowing = {bool : true, string : "UNFOLLOW"};
			$scope.numFollowers = {num : $scope.numFollowers.num + 1};
			console.log($scope.numFollowers.num);
		}
	}

	$scope.goToLink = function(question) {

        if(question.isPoll){
             $location.path('/poll/' + question.questionID);
        }
        else{
            $location.path('/rating/' + question.questionID);
        }

    };
}]);