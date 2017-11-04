'use strict';
var companion = angular.module('companion', [
    'ui.router',
    'firebase',
    'companion.login',
    'companion.listEncounters',
    'companion.detailEncounter',
    'companion.createEncounter',
    'companion.register',
    'companion.admin',
    'companion.landing']);

companion.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/home');

    var config = {
        apiKey: "AIzaSyBdJ5_rL72nxPfJ3TUuBeAI3WBdCxsTpow",
        authDomain: "lunchera-live.firebaseapp.com",
        databaseURL: "https://lunchera-live.firebaseio.com",
        projectId: "lunchera-live",
        storageBucket: "lunchera-live.appspot.com",
        messagingSenderId: "992178344489"
    };
    firebase.initializeApp(config);
});




companion.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    return $firebaseAuth();
  }
]);

companion.run(["$rootScope", "$state", function($rootScope, $state) {
  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
    event.preventDefault(); 
    console.log("oh no")
    // We can catch the error thrown when the $requireSignIn promise is rejected
    // and redirect the user back to the home page
    if (error === "AUTH_REQUIRED") {
      $state.go("login");
    }
  });
}]);






