'use strict';
 
angular.module('companion.detailEncounter', ['ui.router'])
 
// Declared route 
.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('detailEncounter', {
		url: '/mesa/:encounterCountry/:encounterId',
		templateUrl:'pages/encounters/detailEncounter.html',
	 	controller: 'detailEncounterCtrl'	
	})

}])

.controller('detailEncounterCtrl', ['Auth','adminserv','$scope','$state','$rootScope','$firebaseArray','$firebaseObject','MENU_ITEMS', 'THEME','$stateParams', function(Auth ,adminserv,$scope, $state, $rootScope, $firebaseArray, $firebaseObject, MENU_ITEMS, THEME, $stateParams) {
	$scope.iAmAdmin = false;
	$scope.loadingEncounter = true;

	$scope.userIsInQueue = false;
	$scope.userIsPlayer = false;

	$scope.adminserv = adminserv;
	$scope.enterQueueBtnClass="" + THEME.navFabColor;
	$scope.newMessage = {};
	$('.dropdown-button').dropdown();
	$('.tooltipped').tooltip({delay: 50});
	$('.parallax').parallax();
	$('.modal').modal();
	//************Necesario para el MENU!!! ******************
	$scope.menu=MENU_ITEMS;
	$scope.menuClasses=['active','','','']
	$(".button-collapse").sideNav();
	
	//*********************************************************
	//************ Constantes TEMA ******************
	$scope.theme = THEME;
	//***********************************************
	$scope.encounterId = $stateParams.encounterId;
	$('ul.tabs').tabs();
	Auth.$signInAnonymously().then(function(firebaseUser) {
		console.log("Signed in as:", firebaseUser.uid);
		var refStr = 'mesas/'+$stateParams.encounterId;
		var refMesa = firebase.database().ref(refStr);
		var objMesa = $firebaseObject(refMesa);
		objMesa.$loaded().then(function(){
			$scope.thisMesa = objMesa;
			$scope.loadingEncounter = false;
			if (!$scope.thisMesa) {
				$state.go('landing') //debería crear un página vacia que muestre que ese encuentro no existe
			}
			var refChef = firebase.database().ref('chefs/'+$scope.thisMesa.chef);
			var objChef = $firebaseObject(refChef);
			objChef.$loaded().then(function(){
				$scope.chef = objChef;
			})
		})
	}).catch(function(error) {
	  console.error("Authentication failed:", error);
	});

	

	$scope.goto = function(destino){
		$state.go(destino);
	}
	
}])