'use strict';
 
angular.module('companion.createEncounter', ['ui.router'])
 
// Declared route 
.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('createEncounter', {
		url: '/crearEncuentro',
		templateUrl:'pages/encounters/createEncounter.html',
	 	controller: 'createEncounterCtrl',
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

.controller('createEncounterCtrl', ['adminserv','$scope','$state','$rootScope','$firebaseArray','$firebaseObject','MENU_ITEMS', 'THEME', 'COLLECTION', function(adminserv,$scope, $state, $rootScope, $firebaseArray, $firebaseObject, MENU_ITEMS, THEME, COLLECTION) {

	$scope.loadingData = true;
	$scope.gameSource = 'biblioteca'
	$scope.newEncounter={game: null, coverImg:'./assets/lunchera1.jpeg'}
	$scope.unknownGame = {};
	$('.modal').modal();
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
	var refUser = firebase.database().ref('users/'+userKey);
	var objUser = $firebaseObject(refUser);
	objUser.$loaded().then(function(){
		$scope.user = objUser;
	})

	var refGames = firebase.database().ref('games/general').orderByChild('isExpansion').equalTo(false);;
	var listGames = $firebaseArray(refGames);
	listGames.$loaded().then(function(){
		$scope.generalCollection = listGames;
		$scope.loadingData = false;
	})

	
	$('.datepicker').pickadate({
    	selectMonths: true, // Creates a dropdown to control month
    	selectYears: 15, // Creates a dropdown of 15 years to control year
    	onSet: function(context) {
			$scope.newEncounter.date = new Date(context.select).toString();
		},
		min: new Date()
  	});


  	$('select').material_select();

  	$scope.selectGame = function(game){
  		$scope.newEncounter.game = game;
  	}

  	$scope.save = function(){
  		$scope.newEncounter.admin = userKey;
  		$scope.newEncounter.city = $scope.user.cityId;
  		$scope.newEncounter.country = $scope.user.countryId;
  		$scope.newEncounter.commune = $scope.user.communeId;
  		$scope.newEncounter.status = 'active';
  		$scope.newEncounter.availableSeats = [];
  		for (var i = $scope.newEncounter.maxPlayers-1; i >= 0; i--) {
  			$scope.newEncounter.availableSeats[i]={
  				type: 'free',
  				name: "Reservar puesto",
  				photoURL: "./assets/default-avatar.png"
  			}
  		};
  		if ($scope.fotoCover && $scope.fotoCover.size > 1600000) {
  			Materialize.toast('Las imágenes deben pesar menos de 1.6 MegaBytes.', 4000)
  			Materialize.toast('Tus datos no se actualizaron.', 4000)
  		}else{
  			if ($scope.fotoCover) {
  				var storageRef = firebase.storage().ref();
  				var uploadTask = storageRef.child('images/' + userKey + "/mesa/"+$scope.newEncounter.name).put($scope.fotoCover);
  				uploadTask.on('state_changed', function(snapshot){
  				}, function(error) {
  					Materialize.toast('Error con la imagen', 4000)
  				}, function() {
  					var downloadURL = uploadTask.snapshot.downloadURL;
  					$scope.newEncounter.coverImg=downloadURL;
  					if ($scope.newEncounter.date && $scope.newEncounter.startingAt && $scope.newEncounter.place && $scope.newEncounter.date && $scope.newEncounter.privacy ) {
  						var refStr = adminserv.getContextById('ref','country',$scope.user.countryId)+'/encounters'
  						var refEncounters = firebase.database().ref(refStr);
  						var arrayEncounters = $firebaseArray(refEncounters);

  						arrayEncounters.$add($scope.newEncounter).then(function(){
  							//quitar loader
  							$state.go('listEncounters')
  						});
  					}
  				});
  			}
  		}
  		
  		
  	}

  	$scope.gameNotFound = function(){
  		$('#modalGameNotFound').modal('open');
  	}
  	
  	$scope.useUnknownGame = function(){
  		$scope.unknownGame.thumbnail ="http://www.meeplesource.com/prodimages/16mm-MixedMeeples-Original-large.jpg";
  		$scope.newEncounter.game = $scope.unknownGame;
  	}
}])
