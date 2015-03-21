'use strict';

angular.module('owm.navigation', [])

.controller('NavigationController', function ($log, $state, $scope, alertService, authService, featuresService) {

  $scope.user = authService.user;

  /**
   * Use new bootstrap container width on certain pages
   * (can be removed when implemented everywhere)
   */
  $scope.containerTransitional = (
    (featuresService.get('filtersSidebar')  && $state.includes('owm.resource.search')) ||
    (featuresService.get('resourceSidebar') && $state.includes('owm.resource.show')) ||
    $state.includes('member')
  );

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
