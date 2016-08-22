'use strict';

angular.module('owm.shell')

.controller('ShellController', function ($window, $log, $state, $cookies, $scope, $rootScope, $mdSidenav, alertService, authService) {

  var id = 'sidenavLeft';

  $scope.user = authService.user;
  $rootScope.cookieBar = $cookies.get('cookieBar');
  console.log($cookies.get('cookieBar'));
  console.log($rootScope.cookieBar);

  $scope.openMenu = function () {
    $mdSidenav(id).open();
  };

  $scope.closeMenu = function () {
    $mdSidenav(id).close();
  };
  $scope.acceptCookie = function () {
    console.log('hoi');
    $cookies.put('cookieBar', false);
    $rootScope.cookieBar = 'false';
    console.log($rootScope.cookieBar);
  };

  $scope.login = function () {
    $scope.closeMenu();
    authService.loginPopup().then(function () {
      $log.debug('Successfully logged in');
      if ($state.current.name === 'home' || $state.current.name === 'owm.auth.signup') {
        $state.go('owm.person.dashboard');
      }
    });
  };

  $scope.logout = function () {
    alertService.load();
    $scope.closeMenu();
    authService.logoutRedirect();
  };

  $scope.signup = function () {
    $scope.closeMenu();
  };

});
