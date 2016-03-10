'use strict';

angular.module('owm.shell')

.controller('MenuController', function ($window, $log, $rootScope, $scope, $state, $translate, authService, featuresService, contractService) {

  $rootScope.vouchersEnabled = false;

  /**
   * Enable vouchers menu item if user has a MyWheels Go contract (type 60)
   */
  if (featuresService.get('invoiceModuleV3')) {
    $rootScope.$watch(function isAuthenticated () {
      return authService.user.isAuthenticated;
    },
    function loginStatusChanged (authenticated) {
      if (!authenticated) {
        $rootScope.vouchersEnabled = false;
        return;
      }
      contractService.forDriver({ person: authService.user.identity.id }).then(function (contracts) {
        if (!contracts.length) {
          $rootScope.vouchersEnabled = false;
        }
        contracts.some(function (contract) {
          if (contract.type.id === 60) {
            $rootScope.vouchersEnabled = true;
            return true;
          }
        });
      });
    }); // end $watch
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
