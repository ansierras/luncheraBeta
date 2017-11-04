'use strict';
 
angular.module('companion.perfil', ['ui.router'])
 
// Declared route 
.config(["$stateProvider", function($stateProvider) {
    $stateProvider

    .state('perfil', {
		url: '/perfil',
		templateUrl:'pages/perfil/perfil.html',
	 	controller: 'perfilCtrl',
	 	resolve: {
			"currentAuth": ["adminserv", "$state", function(adminserv, $state) {
				// $requireSignIn returns a promise so the resolve waits for it to complete
				// If the promise is rejected, it will throw a $stateChangeError (see above)
				
				//return Auth.$requireSignIn();

				var firebaseUser = adminserv.getUserKey();
				console.log(firebaseUser)
				if (firebaseUser) {
				  return true
				} else {
				  console.log("Signed out");
				  $state.go("landing");
				}
			}]
		}
	})

}])

.controller('perfilCtrl', ['Auth','currentAuth','$scope','$state','$rootScope','$firebaseArray','$firebaseObject','MENU_ITEMS','THEME', 'COLLECTION', 'PLACES', '$http','adminserv', function(Auth, currentAuth,$scope, $state, $rootScope, $firebaseArray, $firebaseObject, MENU_ITEMS, THEME, COLLECTION, PLACES, $http, adminserv) {
	$scope.visibleSection=[true, false, false, false];
	$scope.sectionClasses=["my-side-nav-selected", "", "", ""];
	$scope.loadingUser = true;
	$scope.loadingEncounterList = true;
	$scope.synching = false;
	$scope.adminserv = adminserv;
	$scope.user={}
	$scope.encounters = {
		iAmAdmin: [],
		iAmQueuing: [],
		iAmPlayer: []
	}
	$scope.offers = {
		iMadeOffer: [],
		iAmSelling: []
	}
	$scope.userDeals = [];
	$scope.userDeals2 = [];

	$(".dropdown-button").dropdown();

	var userKey = adminserv.getUserKey();
	var refUser = firebase.database().ref('users/'+userKey);
	var objUser = $firebaseObject(refUser);
	objUser.$loaded().then(function(){
		$scope.user = objUser;
		$scope.changedCountry();
		if ($scope.user.isNew) {
			$scope.modeEdit = true;
			$scope.user.isNew  = false; //esto hay que hacerlo en firebase
			$('#modalWelcome').modal('open');
		}
		$scope.loadingUser = false;
		var refStr = adminserv.getContextById('ref','country',objUser.countryId)+'/encounters'
		var refEncounters = firebase.database().ref(refStr)//.orderByChild("admin").equalTo(userKey);
		var arrayEncounters = $firebaseArray(refEncounters);
		arrayEncounters.$loaded().then(function(){
			for(let encounter of arrayEncounters){
				if (encounter.admin==userKey) {
					$scope.encounters.iAmAdmin.push(encounter);
				}
				if (encounter.players) {
					for(let player of encounter.players){
						if (player.userKey == userKey) {
							$scope.encounters.iAmPlayer.push(encounter)
						}
					}
				}
				if (encounter.queue) {
					for(let queuer of encounter.queue){
						if (queuer.userKey == userKey) {
							$scope.encounters.iAmQueuing.push(encounter)
						}
					}
				}
			}
			$scope.loadingEncounterList = false;
			var refMessages = firebase.database().ref('messages/'+userKey);
			var listMessages = $firebaseArray(refMessages);
			listMessages.$loaded().then(function(){
				$scope.userMessages = listMessages;
			})
		})

		refStr = adminserv.getContextById('ref','country',objUser.countryId)+'/market'
		var refOffers = firebase.database().ref(refStr)//.orderByChild("admin").equalTo(userKey);
		var arrayOffers = $firebaseArray(refOffers);
		arrayOffers.$loaded().then(function(){
			for(let offer of arrayOffers){
				if (offer.admin.userKey==userKey) {
					$scope.offers.iAmSelling.push(offer);
				}
				if (offer.offers) {
					for(let offerer of offer.offers){
						if (offerer.author.userKey == userKey) {
							$scope.offers.iMadeOffer.push(offer)
						}
					}
				}
			}
		})

		refStr = adminserv.getContextById('ref','country',$scope.user.countryId)+'/deals'
		var refDeals = firebase.database().ref(refStr).orderByChild("buyerKey").equalTo(userKey);
		var arrayDeals = $firebaseArray(refDeals);
		arrayDeals.$loaded().then(function(){
			$scope.userDeals = arrayDeals
		})
		var refDeals2 = firebase.database().ref(refStr).orderByChild("sellerKey").equalTo(userKey);
		var arrayDeals2 = $firebaseArray(refDeals2);
		arrayDeals2.$loaded().then(function(){
			$scope.userDeals2 = arrayDeals2		
		})
	})
	
	$scope.countries = PLACES;
	$scope.sincronizar = true;
	
	//************Necesario para el MENU!!! ******************
	$scope.menu=MENU_ITEMS;
	$scope.menuClasses=['','','','active']
	$(".button-collapse").sideNav();
	$scope.goto = function(destino){
		$state.go(destino);
	}
	//*********************************************************
	//************ Constantes TEMA ******************
	$scope.theme = THEME;
	//***********************************************
	$('ul.tabs').tabs();
	$('.collapsible').collapsible();
	$('select').material_select();
	$('.modal').modal();
	$('.parallax').parallax();

	$scope.logout = function(){
		adminserv.logoutUser();
		$state.go('landing');
	}
	
	$scope.filterOwned = function(game){
		return game.owned
	}
	$scope.filterWishlist = function(game){
		return game.wishList
	}
	$scope.editProfile = function(){
		$scope.modeEdit=!$scope.modeEdit;
		if (!$scope.modeEdit) {
			$scope.user.short = {
				name: $scope.user.name,
				lastNames: $scope.user.lastNames,
				cityId: $scope.user.cityId,
				countryId: $scope.user.countryId,
				communeId: $scope.user.communeId,
				photoURL: $scope.user.photoURL
			}
			$scope.user.$save().then(function(ref) {
			 
			}, function(error) {
				console.log("Error:", error);
				Materialize.toast('No se pudo actualizar tu perfil. Intentalo más tarde...', 4000)
			});
		}
		//******************FOTO DE PERFIL *************************
		if ($scope.fotoPerfil && $scope.fotoPerfil.size > 1600000) {
			Materialize.toast('Las imágenes deben pesar menos de 1.6 MegaBytes.', 4000)
			Materialize.toast('Tus datos no se actualizaron.', 4000)
		}else{
			
			if ($scope.fotoPerfil) {
				var storageRef = firebase.storage().ref();
				var uploadTask = storageRef.child('images/' + userKey + "/perfil").put($scope.fotoPerfil);
				uploadTask.on('state_changed', function(snapshot){
				  // Observe state change events such as progress, pause, and resume
				  // See below for more detail
				}, function(error) {
				  // Handle unsuccessful uploads
					subirCover();
				}, function() {
					console.log('foto subida')
				  // Handle successful uploads on complete
				  // For instance, get the download URL: https://firebasestorage.googleapis.com/...
					var downloadURL = uploadTask.snapshot.downloadURL;
					$scope.user.photoURL=downloadURL;
					$scope.user.$save().then(function(ref) {
					 
					}, function(error) {
						console.log("Error:", error);
						Materialize.toast('No se pudo actualizar tu perfil. Intentalo más tarde...', 4000)
					});
				  	
				});
			}
		}
		//********************* FOTO COVER ***************************
		if ($scope.fotoCover && $scope.fotoCover.size > 1600000) {
			Materialize.toast('Las imágenes deben pesar menos de 1.6 MegaBytes.', 4000)
			Materialize.toast('Tus datos no se actualizaron.', 4000)
		}else{
			if ($scope.fotoCover) {
				var storageRef = firebase.storage().ref();
				var uploadTask = storageRef.child('images/' + userKey + "/cover").put($scope.fotoCover);
				uploadTask.on('state_changed', function(snapshot){
				}, function(error) {
				}, function() {
					var downloadURL = uploadTask.snapshot.downloadURL;
					$scope.user.coverImg=downloadURL;
					$scope.user.$save().then(function(ref) {
					}, function(error) {
						console.log("Error:", error);
						Materialize.toast('No se pudo actualizar tu perfil. Intentalo más tarde...', 4000)
					});
				  	
				});
			}
		}
	}
	$scope.openTutorial = function(step){
		switch(step){
			case 0:
				$('.tap-target').tapTarget('open');
				break;
		}
	}
	$scope.changedCountry = function(){
		for (var i = PLACES.length - 1; i >= 0; i--) {
			if(PLACES[i].id == $scope.user.countryId){
				$scope.cities = PLACES[i].cities;
			}
		}
	}
	$scope.archiveMessage = function(selectedMessage){
		var archiveRef = firebase.database().ref("archive/"+userKey);
		var archiveList = $firebaseArray(archiveRef);
		archiveList.$add(selectedMessage);
		var selMessageRef = firebase.database().ref("messages/"+userKey+"/"+selectedMessage.$id);
		var objSelMessage = $firebaseObject(selMessageRef);
		objSelMessage.$remove().then(function() {
			Materialize.toast('Mensaje archivado!', 4000)
		})
	}
	$scope.openRespondModal = function(author){
		$scope.toUser = author;
		$('#modalRespond').modal('open');
	}
	$scope.sendMessage = function(){
		if ($scope.newMessage) {
			var newMessage = {
				author: $scope.user,
				text: $scope.newMessage
			}
			newMessage.author.userKey = userKey;
			newMessage.date = new Date().toString();
			var refMessages = firebase.database().ref('messages/'+$scope.toUser.userKey);
			var listMessages = $firebaseArray(refMessages);
			listMessages.$add(newMessage).then(function(){
				Materialize.toast('Tu mensaje ha sido enviado!', 4000)
			});
		};
	}
	$scope.selectSection = function(index){
		$scope.visibleSection=[false, false, false, false, false];
		$scope.visibleSection[index]=true;
		$scope.sectionClasses = ["","","",""]
		$scope.sectionClasses[index]="my-side-nav-selected"
	}


	$scope.changedCountry();


}])
