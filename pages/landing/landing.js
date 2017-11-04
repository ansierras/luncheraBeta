'use strict';
 
angular.module('companion.landing', ['ui.router'])
 
// Declared route 
.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('landing', {
		url: '/home',
		templateUrl:'pages/landing/landing.html',
	 	controller: 'landingCtrl'
		
	})

}])

.controller('landingCtrl', ['Auth', '$scope','$state','$rootScope','$firebaseArray','$firebaseObject', 'THEME', function(Auth, $scope, $state, $rootScope, $firebaseArray, $firebaseObject, THEME) {
	$('.button-collapse').sideNav();
	$('.parallax').parallax();
	//************Necesario para el MENU!!! ******************
	$(".button-collapse").sideNav();
	$scope.goto = function(destino){
		$state.go(destino);
	}
	//*********************************************************
	//************ Constantes TEMA ******************
	$scope.theme = THEME;
	//***********************************************

	$scope.encounterList = [];
	$scope.formEnviado = false;

	Auth.$signInAnonymously().then(function(firebaseUser) {
		console.log("Signed in as:", firebaseUser.uid);
		var refMesas = firebase.database().ref('mesas').orderByChild('privacy').equalTo('public');
		var arrayMesas = $firebaseArray(refMesas);
		arrayMesas.$loaded().then(function(){
			$scope.mesasList = arrayMesas;
			$('.parallax').parallax();
		})

		var refTopChefs = firebase.database().ref('admin/topChefs');
		var arrayTopChefs = $firebaseArray(refTopChefs);
		arrayTopChefs.$loaded().then(function(){
			var refLunchefs = [];
			var objLunchefs = [];
			$scope.topLunchefs =[]; 
			for (var i = arrayTopChefs.length - 1; i >= 0; i--) {
				refLunchefs[i] = firebase.database().ref('chefs/'+arrayTopChefs[i].$value)
				objLunchefs[i] = $firebaseObject(refLunchefs[i]);
				objLunchefs[i].$loaded().then(function(result){
					$scope.topLunchefs.push(result)
				})
			}
		})
	}).catch(function(error) {
	  console.error("Authentication failed:", error);
	});

	$scope.enviarForm = function(){
		$scope.formEnviado = true;
	}
}])