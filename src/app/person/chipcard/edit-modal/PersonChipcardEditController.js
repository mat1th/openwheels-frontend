'use strict';

angular.module('owm.person')

.controller('PersonChipcardEditController', function ($log, $modalInstance, $translate, $scope, chipcard, chipcardService, alertService) {

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
        isOvfietsEnabled: c.isOvfietsEnabled
      }
    })

    .then(function () {
      angular.extend(chipcard, $scope.chipcard);
      alertService.add('success', $translate.instant('GLOBAL.MESSAGE.SAVE_SUCCESS'), 5000);
      $modalInstance.close(chipcard);
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
    $modalInstance.dismiss();
  };

})
;
