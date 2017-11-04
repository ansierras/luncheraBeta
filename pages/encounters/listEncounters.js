'use strict';
 
angular.module('companion.listEncounters', ['ui.router'])
 
// Declared route 
.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('listEncounters', {
		url: '/mesas',
		templateUrl:'pages/encounters/listEncounters.html',
	 	controller: 'listEncountersCtrl',
	 	resolve: {
			"currentAuth": ["adminserv", "$state", function(adminserv, $state) {
				var firebaseUser = adminserv.getUserKey();
				if (firebaseUser) {
				  return true
				} else {
				  console.log("Signed out");
				  $state.go("login");
				}
			}]
		}	
	})

}])

.controller('listEncountersCtrl', ['adminserv','$scope','$state','$rootScope','$firebaseArray','$firebaseObject','MENU_ITEMS', 'THEME','PLACES', function(adminserv,$scope, $state, $rootScope, $firebaseArray, $firebaseObject, MENU_ITEMS, THEME, PLACES) {
	
	$scope.loadingEncounterList = true;
	$scope.adminserv = adminserv;
	$scope.filter = {communeId:11};
	//************Necesario para el MENU!!! ******************
	$scope.menu=MENU_ITEMS;
	$scope.menuClasses=['active','','','']
	$(".button-collapse").sideNav();
	$scope.goto = function(destino){
		$state.go(destino);
	}
	//*********************************************************
	//************ Constantes TEMA ******************
	$scope.theme = THEME;
	//***********************************************

	var userKey = adminserv.getUserKey();
	var refUser = firebase.database().ref('users/'+userKey+'/short');
	var objUser = $firebaseObject(refUser);
	objUser.$loaded().then(function(){
		$scope.user = objUser;
		console.log(objUser.communeId)
		$scope.currentCity = adminserv.getContextById('name','city', [objUser.countryId, objUser.cityId]);
		for (var i = PLACES.length - 1; i >= 0; i--) {
			if(PLACES[i].id == $scope.user.countryId){
				$scope.cities = PLACES[i].cities;
				for (var j = $scope.cities.length - 1; j >= 0; j--) {
					if($scope.cities[j].id == $scope.user.cityId){
						$scope.communes = $scope.cities[j].communes
					}
				};
			}
		}
		$scope.filter.communeId = objUser.communeId
		var refStr = adminserv.getContextById('ref','country',objUser.countryId)+'/encounters'
		var refEncounters = firebase.database().ref(refStr).orderByChild('privacy').equalTo('public');
		var arrayEncounters = $firebaseArray(refEncounters);
		arrayEncounters.$loaded().then(function(){
			$scope.encounterList = arrayEncounters;
			 var refHosts = [];
			 var objHosts = [];
			for (var i = $scope.encounterList.length - 1; i >= 0; i--) {
				refHosts[i] = firebase.database().ref('users/'+$scope.encounterList[i].admin+'/short');
				objHosts[i] = $firebaseObject(refHosts[i]);
				// objHosts[i].$loaded().then(function(){

				// })
				$scope.encounterList[i].host = objHosts[i]
			}
			$scope.loadingEncounterList = false;
		})
	})

	$scope.filterFunc = function(entry){
		return entry.city==$scope.filter.cityId
	}

}])
