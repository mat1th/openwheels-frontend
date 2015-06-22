'use strict';

angular.module('owm.finance.voucherList', [])

.controller('VoucherListController', function ($timeout, $scope, alertService, voucherService) {

  // Requires parent scope
  var me = $scope.me;

  $scope.vouchers = null;
  $scope.credit = null;

  getCredit();

  $scope.toggle = function () {
    if (!$scope.vouchers) {
      alertService.load($scope);
      getVouchers().finally(function () {
        alertService.loaded($scope);
        $timeout(function () { // timeout ensures voucher list is populated before un-collapsing
          $scope.showVoucherList = !!!$scope.showVoucherList;
        });
      });
    } else {
      $scope.showVoucherList = !!!$scope.showVoucherList;
    }
  };

  function getVouchers () {
    $scope.vouchers = null;
    var promise = voucherService.search({ person: me.id });
    promise.then(function (vouchers) {
      $scope.vouchers = vouchers;
    })
    .catch(function (err) {
      $scope.vouchers = [];
    });
    return promise;
  }

  function getCredit () {
    $scope.credit = null;
    var promise = voucherService.calculateCredit({ person: me.id });
    promise.then(function (credit) {
      $scope.credit = { value: credit };
    })
    .catch(function (err) {
      $scope.credit = { error: true };
    });
    return promise;
  }

});
