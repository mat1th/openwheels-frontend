'use strict';

angular.module('owm.booking.list-rental', [])

.controller('BookingListRentalController', function ($scope, bookingRentalList, authService, bookingService, alertService, API_DATE_FORMAT) {
  $scope.bookings = bookingRentalList.bookings;
  $scope.timeFrame = bookingRentalList.timeFrame;

  var getBookingList = function () {
    $scope.bookings = [];
    alertService.load();
    return authService.me()
    .then(function(me) {
      return bookingService.forOwner({
        person: me.id,
        timeFrame: $scope.timeFrame
      });
    })
    .then( function(bookings) {
      alertService.loaded();
      $scope.bookings = bookings;
    });
  };

  $scope.previous = function() {
    $scope.timeFrame.startDate = moment($scope.timeFrame.startDate).subtract('months', 1).format(API_DATE_FORMAT);
    $scope.timeFrame.endDate = moment($scope.timeFrame.endDate).subtract('months', 1).format(API_DATE_FORMAT);
    return getBookingList();
  };


  $scope.next = function() {
    $scope.timeFrame.startDate = moment($scope.timeFrame.startDate).add('months', 1).format(API_DATE_FORMAT);
    $scope.timeFrame.endDate = moment($scope.timeFrame.endDate).add('months', 1).format(API_DATE_FORMAT);
    return getBookingList();
  };

  $scope.reset = function() {
    $scope.timeFrame.startDate = moment().startOf('month').format(API_DATE_FORMAT);
    $scope.timeFrame.endDate = moment().startOf('month').add('months', 1).format(API_DATE_FORMAT);
    return getBookingList();
  };

})
;
