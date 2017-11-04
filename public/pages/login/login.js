'use strict';

angular.module('companion.login', ['ui.router'])

// Declared route
.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('login', {
		url: '/login',
		templateUrl:'pages/login/login.html',
	 	controller: 'loginCtrl',
	    resolve: {
	      "userIsLogged": ["adminserv", "$state", function(adminserv, $state) {
	        console.log("resolving login")
	        var firebaseUser = adminserv.getUserKey();
	        if (!firebaseUser) {
	          return true
	          console.log("no user")
	        } else {
	          $state.go("perfil");
	        }
	      }]}
		})

}])

.controller('loginCtrl', ['Auth','adminserv','$scope','$state','$rootScope','$firebaseArray','$firebaseObject', function(Auth, adminserv,$scope, $state, $rootScope, $firebaseArray, $firebaseObject) {

$scope.loading = false;
$scope.login = function(){
	$scope.loading = true;
	if ($scope.user.email && $scope.user.password) {
		Auth.$signInWithEmailAndPassword($scope.user.email, $scope.user.password).then(function(firebaseUser){
			var ref = firebase.database().ref('users');
	    	var list = $firebaseArray(ref.orderByChild('uid').equalTo(firebaseUser.uid));
	    	list.$loaded().then(function(){
		    	adminserv.setUserKey(list[0].$id);
		    	adminserv.setUserStatus(list[0].status)
		    	$state.go('perfil');
	    	})
		}).catch(function(error){
			$scope.loading = false;
	    	Materialize.toast('Usuario o contraseña no válido', 3000, 'rounded')
	    })
	}else{
		$scope.loading = false;
		Materialize.toast('Debes llenar todos los campos', 3000, 'rounded')
	}
}

}])
