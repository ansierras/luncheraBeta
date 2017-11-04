'use strict';
 
angular.module('companion.admin', ['ui.router'])
 
// Declared route 
.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('adminsite', {
		url: '/adminsite',
		templateUrl:'pages/adminsite/admin.html',
	 	controller: 'adminCtrl',
	 	resolve: {
			"currentAuth": ["adminserv", "$state", function(adminserv, $state) {
				var firebaseUser = adminserv.getUserKey();
				if (firebaseUser) {
					console.log(adminserv.getUserStatus())
					if (adminserv.getUserStatus() == 'admin') {
						return true
					}else{
						console.log("user not admin")
						$state.go("perfil");
					};
				  
				} else {
				  console.log("Signed out");
				  $state.go("login");
				}
			}]
		}	
	})

}])

.controller('adminCtrl', ['Auth','adminserv','$scope','$state','$rootScope','$firebaseArray','$firebaseObject','MENU_ITEMS','THEME','PLACES', function(Auth, adminserv,$scope, $state, $rootScope, $firebaseArray, $firebaseObject, MENU_ITEMS, THEME, PLACES) {
	$scope.adminserv = adminserv;
	$scope.generalGames = [];
	$scope.pendingGames = [];
	

	var marketDuration = 4; // var in days
	var encounterDuration = 1; // var in days
	//************Necesario para el MENU!!! ******************
	$scope.menu=MENU_ITEMS;
	$scope.menuClasses=['','','','active']
	$(".button-collapse").sideNav();
	$('ul.tabs').tabs();
	$('.collapsible').collapsible();
	$scope.goto = function(destino){
		$state.go(destino);
	}
	//*********************************************************
	//************ Constantes TEMA ******************
	$scope.theme = THEME;
	//***********************************************

	$scope.workingGameDB = false;
	$scope.workingFlushEncounters = false;
	$scope.workingFlushEMarket = false;

	$scope.progress = {width: '0%'}
	var usersRef = firebase.database().ref('users');
	var usersList = $firebaseArray(usersRef);
	usersList.$loaded().then(function(){
		$scope.users = usersList;
		
	})

	$scope.flushEncounters = function(){
		var maxDur = encounterDuration*86400000;
		$scope.workingFlushEncounters = true;
		var today = new Date();

		var encounterRefs =[];
		var encounterLists = [];
		var progress = 0;
		$scope.progress = {width: '0%'}
		for (var i = PLACES.length - 1; i >= 0; i--) {
			var refStr = PLACES[i].ref+'/encounters' 
			encounterRefs[i] = firebase.database().ref(refStr);
			encounterLists[i] = $firebaseArray(encounterRefs[i]);
			encounterLists[i].$loaded().then(function(result){
				for (var j = result.length - 1; j >= 0; j--) {
					var encDate = new Date(result[j].date)
					console.log(encDate)
					if (today-encDate>=maxDur) {
						console.log("should erase")
						result.$remove(result[j])
					}
				};
				progress++;
				$scope.progress = {width: Math.round((progress/PLACES.length)*100)+'%'}
			})
		};
	}

	

	$scope.loadGeneral = function(){
		var gamesRef = firebase.database().ref('games/general').orderByChild("name");
		var gamesList = $firebaseArray(gamesRef);
		gamesList.$loaded().then(function(){
			$scope.generalGames = gamesList;
		})
	}
	$scope.loadPending = function(){
		var gamesRef = firebase.database().ref('games/pending').orderByChild("name");
		var gamesList = $firebaseArray(gamesRef);
		gamesList.$loaded().then(function(){
			$scope.pendingGames = gamesList;
		})
	}

}])