'use strict';

var app = angular.module('myApp', [ 'ui.router', 'ngRoute', 'ngMaterial',
		'ngMessages' ]);
app.config(function($stateProvider) {
	$stateProvider.state('main', {
		url : '/main',
		templateUrl : 'pages/main.html'
	}).state('otherwise', {
		url : '*path',
		templateUrl : 'pages/main.html'
	})
});
/*
 * app.config(function($mdAriaProvider) { $mdAriaProvider.disableWarnings(); });
 */
app.controller('indexController', function($window, $state, $route, $mdDialog,
		$http, $rootScope, $scope, $location, $filter, $mdToast) {
	$scope.navigateHome = function() {
		$window.location.reload();
	}
});

app.controller('MainController', function($window,$timeout, $state, $stateParams,
		$mdDialog, $http, $rootScope, $scope, $location, $filter, $mdToast) {
	$scope.searchList = [];
	$scope.addRow = function() {
		$scope.searchObject = {
			'name' : ''
		}
		$scope.searchList.push($scope.searchObject);
	}
	$scope.search = false;
	$scope.addRow();
	$scope.gitList = [];
	var error = 0;
	$scope.fetch = function() {
		$('#myModal').modal({
			show : true,
			backdrop : 'static'
		});
		$scope.error = false;
		$scope.gitList.length = 0;
		$scope.list = [];
		error = 0;
		for (var i = 0; i < $scope.searchList.length; i++) {
			if ($scope.searchList[i].name != '') {
				if (!$scope.list.includes($scope.searchList[i].name))
					$scope.list.push($scope.searchList[i].name);
			}
		}
		if ($scope.list.length > 1) {
			for (var i = 0; i < $scope.list.length; i++) {
				getUserDetails($scope.list[i]);
			}
			if (error > 0) {
				$scope.search = false;
				alert("There is some invalid user input please verify.");
			} else {
				setTimeout(function() {
					$scope.gitList = $filter('orderBy')($scope.gitList,
							'followers', true, followerSort)
					for (var j = $scope.gitList.length - 1; j >= 0; j--) {
						$scope.gitList[j].score += j + 1;
					}
					$scope.gitList = $filter('orderBy')($scope.gitList,
							'following', true, followerSort)
					for (var j = $scope.gitList.length - 1; j >= 0; j--) {
						$scope.gitList[j].score += j + 1;
					}
					$scope.gitList = $filter('orderBy')($scope.gitList,
							'public_gists', true, followerSort)
					for (var j = $scope.gitList.length - 1; j >= 0; j--) {
						$scope.gitList[j].score += j + 1;
					}
					$scope.gitList = $filter('orderBy')($scope.gitList,
							'public_repos', true, followerSort)
					for (var j = $scope.gitList.length - 1; j >= 0; j--) {
						$scope.gitList[j].score += j + 1;
						if ($scope.gitList[j].type != "User") {
							$scope.gitList[j].score += 1;
						}
					}
					console.log($scope.gitList)
					$scope.gitList = $filter('orderBy')($scope.gitList,
							'score', false, followerSort)
					$scope.search = true;
					$scope.$apply();
					$('#myModal').modal('hide');
				}, 1000);

			}
		} else {
			alert("Please add at least 2 unique usernames to compare.")
			$('#myModal').modal('hide');
		}

	}
	$scope.go = function(item){
		console.log(item)
		$window.location.href = item.html_url;
	}
	function getUserDetails(list) {
		$http.get("https://api.github.com/users/" + list).success(
				function(response) {
					response.score = 0;
					$scope.gitList.push(response);
				}).error(function(response) {
			error++;
		});
	}
});
function followerSort(a, b) {
	if (parseFloat(b.value) < parseFloat(a.value)) {
		return -1;
	} else {
		return 1;
	}

}
