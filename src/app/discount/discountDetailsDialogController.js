'use strict';

angular.module('owm.discount')

.controller('DiscountDetailsDialogController', function ($q, $timeout, $log, $mdDialog, $scope, discount) {

  $scope.discount = discount;

  console.log(discount);

  $scope.cancelDialog = function () {
    $mdDialog.cancel();
  };

});
