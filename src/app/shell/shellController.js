'use strict';

angular.module('owm.shell')

.controller('ShellController', function ($log, $state, $scope, $mdSidenav, alertService, authService) {

  var id = 'sidenavLeft';

  $scope.user = authService.user;

  $scope.openMenu = function () {
    $mdSidenav(id).open();
  };

  $scope.closeMenu = function () {
    $mdSidenav(id).close();
  };

  $scope.login = function () {
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
