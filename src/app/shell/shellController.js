'use strict';

angular.module('owm.shell')

.controller('ShellController', function ($window, $log, $state, $cookies, $scope, $rootScope, $mdSidenav, alertService, authService) {

  var id = 'sidenavLeft';

  $scope.user = authService.user;
  $rootScope.cookieBar = $cookies.get('cookieBar');
  $rootScope.ctaBar = $cookies.get('ctaBar');

  $scope.openMenu = function () {
    $mdSidenav(id).open();
  };

  $scope.closeMenu = function () {
    $mdSidenav(id).close();
  };
  $scope.acceptCookie = function () {
		// Find tomorrow's date.
		var expires = moment().add(180, 'days').toDate();

    $cookies.put('cookieBar', false, {expires: expires});
    $rootScope.cookieBar = 'false';
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

	$scope.showCTA = {show: false};

	$scope.$on('$stateChangeSuccess', function() {
		var a = initCTAValue();
		$scope.showCTA = a;
	});

  function initCTAValue() {
		if($state.current.name.indexOf('home') < 0) {
			return false;
		}
		if(authService.user.isAuthenticated) {
			return false;
		}
    var cta = $cookies.get('ctaBar');
    if(cta === undefined) {
      return true;
    } else {
      return cta;
    }
  }


  $scope.closeCTA = function() {
		var expires = moment().add(180, 'days').toDate();
    $cookies.put('ctaBar', false, {expires: expires});
    $scope.showCTA = false;
  };

  $scope.gotoPage = function() {
    $state.go('list-your-car');
  };

});
