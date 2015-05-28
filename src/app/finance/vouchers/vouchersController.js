'use strict';

angular.module('owm.finance.vouchers', [])

.controller('VouchersController', function ($window, $q, $state, $scope, appConfig, alertService, voucherService, paymentService) {

  /* require parent scope */
  var me = $scope.me;

  $scope.credit = null;
  $scope.requiredValue = null;
  $scope.vouchers = null;
  $scope.voucherOptions = [25,50,100,250,500];

  alertService.load($scope);
  getCredit().then(function () {
    getRequiredValue();
    getVouchers();
  })
  .finally(function () {
    alertService.loaded($scope);
  });

  $scope.buyVoucher = function (value) {
    if (!value || value < 0) { return; }

    alertService.load($scope);
    voucherService.createVoucher({ person: me.id, value: value })
    .then(function (voucher) {
      return paymentService.payVoucher({ voucher: voucher.id });
    })
    .then(function (data) {
      if (data.url) {
        redirect(data.url);
      } else {
        throw new Error('Er is een fout opgetreden');
      }
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded($scope);
    });
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

  function getRequiredValue () {
    $scope.requiredValue = null;
    var promise = voucherService.calculateRequiredCredit({ person: me.id });
    promise.then(function (value) {
      $scope.requiredValue = { value: value };
    })
    .catch(function (err) {
      $scope.requiredValue = { error: true };
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

  function redirect (url) {
    var redirectTo = appConfig.appUrl + '/' + $state.href('owm.finance.v3Index');
    $window.location.href = url + '?redirectTo=' + encodeURIComponent(redirectTo);
  }

})
;
