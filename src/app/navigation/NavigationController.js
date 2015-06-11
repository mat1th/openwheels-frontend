'use strict';

angular.module('owm.navigation', [])

.controller('NavigationController', function ($log, $state, $rootScope, $scope, alertService, authService, featuresService, contractService) {

  $scope.user = authService.user;

  /**
   * HACK
   * Determine whether to show the vouchers menu item by checking the user's contracts
   */
  $rootScope.vouchersEnabled = false;
  if (featuresService.get('invoiceModuleV3')) {
    authService.userPromise().then(function (user) {
      if (!user.identity) { return; }
      contractService.forDriver({ person: user.identity.id }).then(function (contracts) {
        if (!contracts.length) { return; }
        if (!contracts[0].type) { return; }
        $rootScope.vouchersEnabled = contracts[0].type.id === 60;
        $log.debug('Vouchers enabled');
      });
    });
  }

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
