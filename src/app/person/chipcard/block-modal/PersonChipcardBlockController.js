'use strict';

angular.module('owm.person')

.controller('PersonChipcardBlockController', function ($log, $modalInstance, $translate, $scope, alertService, chipcardService, chipcard) {
  $scope.chipcard = angular.copy(chipcard);

  $scope.ok = function () {

    // block chipcard
    $scope.busy = true;
    var c = $scope.chipcard;
    chipcardService.block({
      id: c.mifareUid
    })

    .then(function () {
      // success
      angular.extend(chipcard, $scope.chipcard);
      alertService.add('success', $translate.instant('GLOBAL.MESSAGE.SAVE_SUCCESS'), 5000);
      $modalInstance.close(chipcard);
    })

    .catch(function () {
      alertService.addGenericError();
    })

    .finally(function () {
      $scope.busy = false;
    });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss();
  };

})
;
