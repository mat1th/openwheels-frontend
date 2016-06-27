'use strict';

angular.module('owm.booking.timeframe', [])

.controller('BookingTimeframeController', function ($scope, $stateParams, $uibModalInstance, booking, API_DATE_FORMAT) {
  $scope.booking = booking;

  $scope.dateConfig = {
    //model
    modelFormat: API_DATE_FORMAT,
    formatSubmit: 'yyyy-mm-dd',
    //view
    viewFormat: 'DD-MM-YYYY',
    format: 'dd-mm-yyyy',
    //options
    selectMonths: true,
    container: 'body'
  };

  $scope.timeConfig = {
    //model
    modelFormat: API_DATE_FORMAT,
    formatSubmit: 'HH:i',
    //view
    viewFormat: 'HH:mm',
    format: 'HH:i',
    //options
    interval: 15,
    container: 'body'
  };

  // FIXME: duplicate code in ResourceShowController
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
        end   = begin.clone().startOf('day').add('hours', 18);
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
  // /FIXME: duplicate code

  $scope.ok = function () {
    $uibModalInstance.close($scope.booking);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
})

;
