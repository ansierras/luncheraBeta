'use strict';

angular.module('companion.register', ['ui.router'])

// Declared route
.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('register', {
		url: '/registro',
		templateUrl:'pages/register/register.html',
		controller: 'registerCtrl',
		resolve: {
			"userIsLogged": ["adminserv", "$state", function(adminserv, $state) {
				console.log("resolving register")
    			var firebaseUser = adminserv.getUserKey();
				if (!firebaseUser) {
			  		return true
				} else {
			  		$state.go("perfil");
				}
  			}]
  		}	
	})
}])

.controller('registerCtrl', ['adminserv','$scope','$state','$rootScope','$firebaseArray','$firebaseObject','Auth','PLACES', function(adminserv,$scope, $state, $rootScope, $firebaseArray, $firebaseObject, Auth, PLACES) {
	$scope.loading = false;
	console.log(PLACES)
	$scope.countries = PLACES;
	$scope.cities = [];
	$scope.newUser = {countryId: 1, cityId: 1, communeId: 11};
	$('select').material_select();


	$scope.createAccount = function(){
		$scope.loading = true;
		var ready2create = true;
		if ($scope.newUser.password!=$scope.newUser.password2) {
			ready2create = false;
			$scope.newUser.password = null;
			$scope.newUser.password2 = null;
			$scope.loading = false;
			Materialize.toast('Contraseña incorrecta, ingrésala de nuevo', 4000);
		}
		if (!$scope.newUser.name || !$scope.newUser.lastNames || !$scope.newUser.email || !$scope.newUser.password) {
			ready2create = false;
			$scope.loading = false;
			Materialize.toast('Te falta llenar algunos campos', 4000);
		}
		if (ready2create) {
			$scope.newUser.photoURL = 'https://robohash.org/'+$scope.newUser.email;
			$scope.newUser.coverImg = './assets/login.jpg'
			$scope.newUser.memberSince = new Date().toString();
			$scope.newUser.isNew = true;
			$scope.newUser.short = {
				name: $scope.newUser.name,
				lastNames: $scope.newUser.lastNames,
				cityId: $scope.newUser.cityId,
				countryId: $scope.newUser.countryId,
				photoURL: $scope.newUser.photoURL,
				communeId: $scope.newUser.communeId
			}
			Auth.$createUserWithEmailAndPassword($scope.newUser.email, $scope.newUser.password)
			.then(function(firebaseUser) {
				$scope.newUser.uid = firebaseUser.uid;
				var usersRef = firebase.database().ref('users');
			  	var usersList = $firebaseArray(usersRef);
			  	usersList.$loaded().then(function(){
			  		usersList.$add($scope.newUser).then(function(createResult){
			  			adminserv.setUserKey(createResult.key);
			  			$scope.cargando = false;
			  			$state.go('perfil');
			  		})
			  	})
			}).catch(function(error) {
				$scope.loading = false;
				console.error("Error: ", error);
			});
		}
	}
	$scope.changedCountry = function(){
		console.log($scope.newUser.countryId)
		for (var i = PLACES.length - 1; i >= 0; i--) {
			if(PLACES[i].id == $scope.newUser.countryId){
				$scope.cities = PLACES[i].cities;
				$scope.changedCity();
			}
		}
	}
	$scope.changedCity = function(){
		for (var i = $scope.cities.length - 1; i >= 0; i--) {
			if($scope.cities[i].id == $scope.newUser.cityId){
				$scope.communes = $scope.cities[i].communes
			}
		};
	}
	$scope.changedCountry();

}])
