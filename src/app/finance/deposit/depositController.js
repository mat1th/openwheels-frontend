'use strict';

angular.module('owm.finance.deposit', [])

.controller('DepositController', function ($scope, alertService, me) {

  $scope.data = { mandate: false };
  $scope.busy = false;

  $scope.payDeposit = function () {
    alertService.load($scope);
    $scope.busy = true;

    // financeService.payDeposit().then(function () {

    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded($scope);
      $scope.busy = false;
    });
  };

});
