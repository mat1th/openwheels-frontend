'use strict';

angular.module('owm.finance.deposit', [])

.controller('DepositController', function ($scope, alertService, depositService, me) {

  $scope.data = { mandate: false };
  $scope.busy = false;

  $scope.payDeposit = function () {
    $scope.busy = true;
    alertService.load($scope);
    depositService.requestContractAndPay({
      person: me.id
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      $scope.busy = false;
      alertService.loaded($scope);
    });
  };
});
