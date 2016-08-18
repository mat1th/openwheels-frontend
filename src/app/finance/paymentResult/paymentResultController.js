'use strict';
angular.module('owm.finance.paymentResult', [])

.controller('PaymentResultController', function ($scope, $state, $window, orderStatusId, account2Service, alertService, voucherService, me, paymentService, bookingService, chipcardService, linksService, API_DATE_FORMAT) {

  var afterPayment;
  $scope.isBusy = true;
  $scope.isApproved = false;
  $scope.name = '';
  $scope.person = '';
  $scope.fish = false;
  $scope.bookings = [];

  $scope.result = {
    success: (orderStatusId > 0)
  };

  $scope.buyVoucher = function (value) { //buy a vouchure from 0.01 cents
    if (!value || value < 0) {
      return;
    }
    alertService.load($scope);
    voucherService.createVoucher({
        person: me.id,
        value: value
      })
      .then(function (voucher) {
        return paymentService.payVoucher({
          voucher: voucher.id
        });
      })
      .then(function (data) {
        if (!data.url) {
          throw new Error('Er is een fout opgetreden');
        }
        /* redirect to payment url */
        redirect(data.url);
      })
      .catch(function (err) {
        alertService.addError(err);
      })
      .finally(function () {
        alertService.loaded($scope);
      });
  };

  $scope.goAfterPayment = function () {
    if (!afterPayment) {
      $state.go('home');
    }

    if ($scope.result.success) {
      $state.go(afterPayment.success.stateName, afterPayment.success.stateParams);
    } else {
      $state.go(afterPayment.error.stateName, afterPayment.error.stateParams);
    }
  };

  function getBookings() { //get all the bookings from the user
    $scope.isBusy = true;
    alertService.load($scope);

    bookingService.getBookingList({
        person: me.id,
        asc: true,
        timeFrame: {
          startDate: moment().format(API_DATE_FORMAT),
          endDate: moment().add(1, 'year').format(API_DATE_FORMAT)
        },
        cancelled: false
      })
      .then(function (bookings) {
        var data = [];
        bookings.forEach(function (elm) {
          if (me.numberOfBookings <= 1 || elm.approved === 'OK') { //only aproved ones in the list
            if (elm.resource.locktype === 'chipcards') {
              chipcardService.getFish({
                person: me.id
              }).then(function (fish) {
                if (fish !== null || fish !== undefined) {
                  $scope.fish = fish;
                }
              });
            } else if (elm.resource.locktype === 'meeting') {
              elm.link = linksService.bookingAgreementPdf(elm.id);
            }
            data.push(elm);
          }
        });
        return data;
      }).then(function (bookings) {
        $scope.bookings = bookings;
      }).catch(function (err) {

        alertService.addError(err);
      }).finally(function () {

        $scope.isBusy = false;
        alertService.loaded($scope);
      });
  }
  getBookings();

  function init() {
    try {
      $scope.afterPayment = afterPayment = JSON.parse(sessionStorage.getItem('afterPayment'));
    } catch (e) {
      $scope.afterPayment = afterPayment = null;
    }
    sessionStorage.removeItem('afterPayment');

    account2Service.forMe({}).then(function (data) {
      data.every(function (elm) {
        if (elm.approved === true) {
          $scope.isApproved = true;
          $scope.name = elm.lastName;
          $scope.person = elm.person;
          return false;
        } else {
          return true;
        }
      });
      $scope.isBusy = false;
    });
  }

  function redirect(url) {
    $window.location.replace(url, '_top');
  }
  //start page
  init();

});
