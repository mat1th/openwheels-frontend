'use strict';

angular.module('owm.navigation', [])

.controller('NavigationController', function ($log, $state, $scope, alertService, authService, featuresService) {

  $scope.user = authService.user;

  $scope.login  = function () {
    authService.loginPopup().then(function () {
      $log.debug('Successfully logged in');
      if ($state.current.name === 'home') {
        $state.go('owm.person.dashboard');
      }
    });
  };

  $scope.logout = function () {
    alertService.load();
    authService.logoutRedirect();
  };

})
;
