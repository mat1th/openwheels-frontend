'use strict';

angular.module('owm.person')

.controller('PersonChipcardEditController', function ($log, $uibModalInstance, $translate, $scope, chipcard, chipcardService, alertService) {

  $scope.chipcard = angular.copy(chipcard);
  $scope.busy = false;

  $scope.ok = function () {

    // Save chipcard
    $scope.busy = true;

    var c = $scope.chipcard;
    chipcardService.alter({
      id       : c.mifareUid,
      newProps : {
        description: c.description,
      }
    })

    .then(function () {
      angular.extend(chipcard, $scope.chipcard);
      alertService.add('success', $translate.instant('GLOBAL.MESSAGE.SAVE_SUCCESS'), 5000);
      $uibModalInstance.close(chipcard);
    })

    .catch(function (err) {
      $log.debug('error', err);
      alertService.addGenericError();
    })

    .finally(function () {
      $scope.busy = false;
    });
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss();
  };

})
;
