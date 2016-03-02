'use strict';

angular.module('owm.shell')

.controller('MenuController', function ($window, $log, $rootScope, $scope, $state, $translate, authService, featuresService, contractService) {

  $rootScope.vouchersEnabled = false;

  /**
   * Enable vouchers menu item if user has a MyWheels Go contract (type 60)
   */
  if (featuresService.get('invoiceModuleV3')) {
    authService.userPromise().then(function (user) {
      if (!user.identity) { return; }

      contractService.forDriver({ person: user.identity.id }).then(function (contracts) {
        if (!contracts.length) { return; }

        contracts.some(function (contract) {
          if (contract.type.id === 60) {


            $rootScope.vouchersEnabled = true;


            return true;
          }
        });
        $log.debug('Vouchers enabled? ' + $rootScope.vouchersEnabled);
      });
    });
  }

  $scope.navigate = function (toState, toParams) {
    $scope.closeMenu();
    $state.go(toState, toParams);
  };

  $scope.translateAndNavigate = function (translateKey) {
    var translated = $translate.instant(translateKey);
    $scope.closeMenu();
    $window.location.href = translated;
  };

});
