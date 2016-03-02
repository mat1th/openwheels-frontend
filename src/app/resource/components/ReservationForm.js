'use strict';

angular.module('owm.resource.reservationForm', [])

.directive('reservationForm', function () {
  return {
    restrict: 'E',
    scope: {
      person  : '=',
      resource: '=',
      booking: '=', // { beginRequested, endRequested, remarkRequester, contract }
      showPrice: '='
    },
    templateUrl: 'resource/components/reservationForm.tpl.html',
    controller: 'ReservationFormController'
  };
})

.controller('ReservationFormController', function (
  $log, $q, $timeout, $filter, $rootScope, $scope, $state,
  API_DATE_FORMAT, resourceService, invoice2Service, alertService, authService, bookingService, discountService,
  contractService, featuresService) {

  $scope.features = $rootScope.features;

  $scope.dateConfig = {
    modelFormat: API_DATE_FORMAT,
    formatSubmit: 'yyyy-mm-dd',
    viewFormat: 'DD-MM-YYYY',
    format: 'dd-mm-yyyy',
    selectMonths: true
  };

  $scope.timeConfig = {
    modelFormat: API_DATE_FORMAT,
    formatSubmit: 'HH:i',
    viewFormat: 'HH:mm',
    format: 'HH:i',
    interval: 15
  };

  function getStartOfThisQuarter () {
    var mom = moment();
    var quarter = Math.floor((mom.minutes() | 0) / 15); // returns 0, 1, 2 or 3
    var minutes = (quarter * 15) % 60;
    mom.minutes(minutes);
    return mom;
  }

  $scope.setTimeframe = function(addDays) {
    var now = getStartOfThisQuarter();
    $scope.booking.beginRequested = now.add('days', addDays).format(API_DATE_FORMAT);
    $scope.booking.endRequested = now.add('days', addDays).add('hours', 6).format(API_DATE_FORMAT);
  };

  function isToday (_moment) {
    return _moment.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD');
  }

  $scope.onBeginDateChange = function () {
    var booking = $scope.booking;
    var begin = booking.beginRequested && moment(booking.beginRequested, API_DATE_FORMAT);
    var end   = booking.endRequested && moment(booking.endRequested, API_DATE_FORMAT);

    if (begin && !isToday(begin)) {
      begin = begin.startOf('day').add('hours', 9);
      if (!end) {
        end = begin.clone().startOf('day').add('hours', 18);
      }
      if (begin < end) {
        booking.beginRequested = begin.format(API_DATE_FORMAT);
        booking.endRequested = end.format(API_DATE_FORMAT);
      }
    }
  };

  $scope.onEndDateChange = function () {
    var booking = $scope.booking;
    var begin = booking.beginRequested && moment(booking.beginRequested, API_DATE_FORMAT);
    var end   = booking.endRequested && moment(booking.endRequested, API_DATE_FORMAT);

    if (end && !isToday(end)) {
      end = end.startOf('day').add('hours', 18);
      if (!begin) {
        begin = end.clone().startOf('day').add('hours', 9);
      }
      if (begin < end) {
        booking.beginRequested = begin.format(API_DATE_FORMAT);
        booking.endRequested = end.format(API_DATE_FORMAT);
      } else {
        booking.beginRequested = begin.format(API_DATE_FORMAT);
        booking.endRequested = begin.format(API_DATE_FORMAT);
      }
    }
  };

  $scope.price = null;
  $scope.isPriceLoading = false;
  $scope.$watch('booking.beginRequested', onTimeFrameChange);
  $scope.$watch('booking.endRequested', onTimeFrameChange);

  var timer;
  function onTimeFrameChange () {
    $timeout.cancel(timer);
    timer = $timeout(function () {
      loadAvailability().then(function (availability) {
        if (availability.available === 'yes') {
          loadContractsOnce().then(function () {
            if (featuresService.get('calculatePrice')) {
              loadPrice();
            }
          });
        } else {
          if (featuresService.get('calculatePrice')) {
            loadPrice();
          }
        }
      });
    }, 100);
  }

  $scope.availability = null;
  $scope.isAvailabilityLoading = false;
  function loadAvailability () {
    var dfd = $q.defer();
    var b = $scope.booking;
    var r = $scope.resource;
    $scope.availability = null;
    $scope.price = null;

    if (b.beginRequested && b.endRequested) {
      $scope.isAvailabilityLoading = true;
      resourceService.checkAvailability({
        resource: r.id,
        timeFrame: {
          startDate: b.beginRequested,
          endDate: b.endRequested
        }
      })
      .then(function (isAvailable) {
        $scope.availability = { available: isAvailable ? 'yes' : 'no' };
        dfd.resolve($scope.availability);
      })
      .catch(function () {
        $scope.availability = { available: 'unknown' };
        dfd.resolve($scope.availability);
      })
      .finally(function () {
        $scope.isAvailabilityLoading = false;
      });
    }
    return dfd.promise;
  }

  function loadContractsOnce () {
    var dfd = $q.defer();
    if ($scope.contractOptions) {
      dfd.resolve($scope.contractOptions);
    }
    else if (!$scope.person) {
      $scope.contractOptions = [];
      $scope.booking.contract = null;
      dfd.resolve([]);
    } else {
      contractService.forDriver({ person: $scope.person.id }).then(function (contracts) {
        $scope.contractOptions = contracts || [];
        $scope.booking.contract = contracts.length ? contracts[0].id : null;
        if (featuresService.get('calculatePrice')) {
          $scope.$watch('booking.contract', loadPrice);
        }
        dfd.resolve(contracts);
      });
    }
    return dfd.promise;
  }

  function loadPrice () {
    var r = $scope.resource;
    var b = $scope.booking;
    var params;
    $scope.price = null;

    if ( $scope.availability &&
         ['yes','unknown'].indexOf($scope.availability.available) >= 0 &&
         (b.beginRequested && b.endRequested) ) {
      $scope.isPriceLoading = true;
      params = {
        resource : r.id,
        timeFrame: {
          startDate: b.beginRequested,
          endDate: b.endRequested
        }
      };
      if (b.contract) {
        params.contract = b.contract;
      }
      invoice2Service.calculatePrice(params).then(function (price) {
        $scope.price = price;
      })
      .finally(function () {
        $scope.isPriceLoading = false;
      });
    }
  }

  $scope.priceHtml = function (price) {
    var s = '';
    if (price.rent > 0) { s += 'Huur: ' + $filter('currency')(price.rent) + '<br/>'; }
    if (price.insurance > 0) { s += 'Verzekering: ' + $filter('currency')(price.insurance) + '<br/>'; }
    if (price.booking_fee > 0) { s += 'Boekingskosten: ' + $filter('currency')(price.booking_fee) + '<br/>'; }
//    if (price.redemption > 0) { s+='Afkoop eigen risico: ' + $filter('currency')(price.redemption) + '<br/>'; }
    s += 'Totaal: ' + $filter('currency')(price.total);
    return s;
  };

  $scope.createBooking = function(booking) {
    if (!booking.beginRequested || !booking.endRequested) {
      return alertService.add('danger', $filter('translate')('DATETIME_REQUIRED'), 5000);
    }

    // Als je nog niet bent ingelogd is er
    // even een andere flow nodig
    if (featuresService.get('bookingSignupWizard')) {

      if (!$scope.person || $scope.person.status === 'new') { // should register, or upload driver's license
        $state.go('newRenter-register', { // should register
          city: $scope.resource.city ? $scope.resource.city : 'utrecht',
          resourceId: $scope.resource.id,
          startTime: booking.beginRequested,
          endTime: booking.endRequested
        });
        return;
      }
      else if (!booking.contract) { // should pay deposit to get a contract
        $state.go('newRenter-deposit', {
          city: $scope.resource.city ? $scope.resource.city : 'utrecht',
          resourceId: $scope.resource.id,
          startTime: booking.beginRequested,
          endTime: booking.endRequested
        });
        return;
      }
    }

    alertService.load();

    return authService.me().then(function(me) {
      /**
       * Create booking
       */
      return bookingService.create({
        resource: $scope.resource.id,
        timeFrame: {
          startDate: booking.beginRequested,
          endDate: booking.endRequested
        },
        person: me.id,
        contract: booking.contract,
        remark: booking.remarkRequester
      });
    })

    .then(function (response) {
      if (!booking.discountCode) {
        return response;
      }
      else {
        /**
         * Apply discount
         */
        return discountService.apply({
          booking: response.id,
          discount: booking.discountCode
        })
        .then(function (discountResponse) {
          $log.debug('successfully applied discount');
          return response; // <-- the response from bookingService.create
        })
        .catch(function (err) {
          $log.debug('error applying discount');
          alertService.addError(err);
          return response; // <-- continue, although the discount has not been applied!
        });
      }
    })
    .then(function (response) {
      if( response.beginBooking ) {
        alertService.add('success', $filter('translate')('BOOKING_ACCEPTED'), 10000);
      } else {
        alertService.add('info', $filter('translate')('BOOKING_REQUESTED'), 5000);
      }
      if(response.approved === 'BUY_VOUCHER') {
        return $state.go('owm.finance.vouchers');
      } else {
        return $state.go('owm.person.dashboard');
      }
    })
    .catch(alertService.addError)
    .finally(alertService.loaded);
  };

})
;
