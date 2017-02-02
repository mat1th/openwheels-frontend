'use strict';

angular.module('vouchersDirective', [])

.directive('voucher', function () {
  return {
    restrict: 'E',
    templateUrl: 'directives/vouchers/vouchers.tpl.html',
    scope: {
      me: '=',
      booking: '=',
      onChanged: '&',
    },
    controller: function ($scope, voucherService, alertService, bookingService, $rootScope, paymentService, appConfig, $state, $window, contractService, $mdDialog) {
      $scope.features = $rootScope.features;

      $scope.extraDrivers = {price: 1.25, check: false, drivers: [], new: ''};
      $scope.vouchureError = {
        show: false,
        message: ''
      };

      init($scope.booking);
      function init(booking) {
        var _booking = booking;
        contractService.forBooking({booking: _booking.id})
        .then(function(contract) {
          _booking.contract = contract;
          if(contract.type.id === 60) {
            return bookingService.driversForBooking({booking: _booking.id});
          } else {
            return [];
          }
        })
        .then(function(drivers) {
          _booking.drivers = drivers;
          getVoucherPrice(_booking);
        });
      }

      function getVoucherPrice(booking) {
        return voucherService.calculateRequiredCreditForBooking({
          booking: booking.id
        }).then(function (value) {
          var bookingObject = {
            riskReduction: booking.riskReduction,
            resource: booking.resource,
            approved: booking.approved,
            id: booking.id,
            title: 'Rit op ',
            booking_price: value.booking_price,
            contract_type: booking.contract.type.id,
            drivers_count: booking.drivers.length,
            km_price: value.km_price,
            discount: value.discount,
          };
          if(bookingObject.drivers_count) {
            $scope.extraDrivers.check = true;
          }
          booking.details = bookingObject;
          $scope.booking = booking;
          $scope.booking.details.extra_drivers_price = $scope.extraDrivers.check ? ($scope.extraDrivers.drivers.length + $scope.booking.details.drivers_count) * $scope.extraDrivers.price : 0;

          return bookingObject;
        }).then(function () {
          $scope.priceCalculated = true;
          alertService.loaded();
          $scope.isBusy = false;
        }).catch(function (err) {
          alertService.addError(err);
        });
      }

      $scope.redemptionPending = {}; /* by booking id */
      $scope.toggleRedemption = function (booking) {
        alertService.closeAll();
        alertService.load($scope);

        /* checkbox is already checked, so new value is now: */
        var newValue = $scope.booking.details.riskReduction;
        $scope.redemptionPending[booking.id] = true;

        bookingService.alter({
          booking: booking.id,
          newProps: {
            riskReduction: newValue
          }
        })
        .then(function (value) {
          /* recalculate amounts */
          return getVoucherPrice(booking);
        })
        .then(function () {
          $scope.vouchureError.show = false;
          $scope.booking.details.riskReduction = newValue;
        })
        .catch(function (err) {
          if (err.message === 'Bij je huidige gebruiksvorm is verlaging van het eigen risico verplicht.') {
            $scope.vouchureError = {
              show: true,
              message: err.message
            };
          } else {
            alertService.addError(err);
          }
          /* revert */
          $scope.booking.details.riskReduction = !!!$scope.booking.details.riskReduction;

        })
        .finally(function () {
          $scope.onChanged($scope.booking);
          $scope.redemptionPending = {};
          alertService.loaded($scope);
          $scope.isBusy = false;
        });
      };

      /* EXTRA DRIVER FOR GO CONTRACT */
      $scope.toggleExtraDrivers = function(to, event) {
        var numberOfDrivers = $scope.extraDrivers.drivers.length + $scope.booking.details.drivers_count;

        if(to === undefined) { // if clicking input directly
          if(!$scope.extraDrivers.check && numberOfDrivers) { // and checked -> unchecked
            var confirm = $mdDialog.confirm()
            .title('Wil je de extra bestuurders verwijderen?')
            .textContent('Je hebt al extra bestuurders toegevoegd. Weet je zeker dat je ze weer wilt verwijderen van de rit?')
            .ok('Ja, verwijder')
            .cancel('Nee ');

            $mdDialog.show(confirm)
            .then(function(res) {
              return bookingService.clearDrivers({booking: $scope.booking.id});
            })
            .then(function() {
              $scope.extraDrivers.check = false;
              $scope.booking.details.booking_price.total -= $scope.extraDrivers.drivers.length * $scope.extraDrivers.price;
              $scope.extraDrivers.drivers = [];
              $scope.booking.details.extra_drivers_price = $scope.extraDrivers.check ? ($scope.extraDrivers.drivers.length + $scope.booking.details.drivers_count) * $scope.extraDrivers.price : 0;
              $scope.onChanged($scope.booking);
            })
            .catch(function(err) {
              $scope.extraDrivers.check = true;
            });
          }
        }
        if(to === true && $scope.extraDrivers.check !== true) { //focus, select if not already
          $scope.extraDrivers.check = true;
          return;
        }
        if(to === false) { // blur, uncheck if no extra drivers
          if(numberOfDrivers === 0) {
            $scope.extraDrivers.check = false;
          } else {
            $scope.extraDrivers.check = true;
          }
        }
      };

      $scope.addExtraDriver = function() {
        if($scope.extraDrivers.new === '') {
          return;
        }

        if($scope.extraDrivers.drivers.indexOf($scope.extraDrivers.new) < 0) {
          alertService.closeAll();
          alertService.load();

          bookingService.addDriver({booking: $scope.booking.id, email: $scope.extraDrivers.new})
          .then(function(booking) {
            $scope.extraDrivers.drivers.push($scope.extraDrivers.new);
            $scope.booking.details.booking_price.total += $scope.extraDrivers.price;
            $scope.booking.details.extra_drivers_price = $scope.extraDrivers.check ? ($scope.extraDrivers.drivers.length + $scope.booking.details.drivers_count) * $scope.extraDrivers.price : 0;
          })
          .catch(function(e) {
            alertService.addError(e);
          })
          .finally(function() {
            $scope.onChanged($scope.booking);
            $scope.extraDrivers.new = '';
            $scope.extraDrivers.check = true;
            alertService.loaded();
            $scope.formExtraDriver.$setPristine();
          });
        }
      };


      $scope.removeExtraDriver = function(driver) {
        alertService.closeAll();
        alertService.load();
        var index = $scope.extraDrivers.drivers.indexOf(driver);
        if(index >= 0) {
          bookingService.removeDriver({booking: $scope.booking.id, email: $scope.extraDrivers.drivers[index]})
          .then(function(booking) {
            $scope.extraDrivers.drivers.splice(index, 1);
            $scope.booking.details.extra_drivers_price = $scope.extraDrivers.check ? ($scope.extraDrivers.drivers.length + $scope.booking.details.drivers_count) * $scope.extraDrivers.price : 0;
          })
          .catch(function(e) {
            alertService.addError(e);
          })
          .finally(function() {
            $scope.onChanged($scope.booking);
            alertService.loaded();
          });
        }
      };
      /* //end//EXTRA DRIVER FOR GO CONTRACT */

    }
  };
});
