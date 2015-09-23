'use strict';

angular.module('owm.finance.vouchers', [])

.controller('VouchersController', function ($window, $q, $state, $scope, appConfig, alertService, voucherService,
  paymentService, bookingService, me) {

  $scope.busy = true;
  $scope.requiredValue = null;
  $scope.voucherOptions = [25,50,100,250,500];
  $scope.showVoucherOptions = false;
  $scope.redemptionPending = {}; /* by booking id */

  alertService.load($scope);
  getRequiredValue().then(getBookings).finally(function () {
    alertService.loaded($scope);
    $scope.busy = false;
  });

  $scope.toggleVoucherOptions = function (toggle) {
    $scope.showVoucherOptions = toggle;
  };

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

  $scope.toggleRedemption = function (booking) {
    alertService.closeAll();
    alertService.load($scope);

    $scope.redemptionPending[booking.id] = true;
    bookingService.alter({
      booking: booking.id,
      riskReduction: !booking.riskReduction
    })
    .then(function () {
      /* reload price */
      return getRequiredValue();
    })
    .then(function (requiredValue) {
      /* reload bookings */
      return getBookings(requiredValue);
    })
    .catch(function (err) {
      alertService.addError(err);
      booking.riskReduction = !!!booking.riskReduction;
    })
    .finally(function () {
      alertService.loaded($scope);
      $scope.redemptionPending[booking.id] = false;
    });
  };

  function getRequiredValue () {
    return voucherService.calculateRequiredCredit({
      person: me.id
    }).then(function (value) {
      $scope.requiredValue = value;
      return value;
    })
    .catch(function (err) {
      alertService.addError(err);
    });
  }

  /* load all bookings contained in the requiredValue object */
  function getBookings (requiredValue) {
    if (!requiredValue.bookings || !requiredValue.bookings.length) { return true; }

    var promises = [];
    requiredValue.bookings.forEach(function (booking) {
      promises.push(
        bookingService.get({
          booking: booking.id
        }).then(function (_booking) {
          angular.extend(booking, _booking);
        })
      );
    });
    return $q.all(promises).catch(function (err) {
      alertService.addError(err);
    });
  }

  function redirect (url) {
    var redirectTo = appConfig.appUrl + $state.href('owm.finance.vouchers');
    $window.location.href = url + '?redirectTo=' + encodeURIComponent(redirectTo);
  }

})
;
