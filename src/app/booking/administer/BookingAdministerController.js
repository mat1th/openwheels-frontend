'use strict';

angular.module('owm.booking.administer', [])

.controller('BookingAdministerController', function ($scope, $state, $translate, alertService, bookingService, booking) {

  $scope.booking  = booking;
  $scope.resource = booking.resource;
  $scope.trip     = angular.copy(booking.trip);

  $scope.alreadyFilled = booking.trip.odoBegin && booking.trip.odoEnd;

  $scope.submit = function () {
    alertService.load();

    var params = {
      booking : $scope.booking.id,
      odoBegin: $scope.trip.odoBegin
    };

    // End is NOT required
    if ($scope.trip.odoEnd) {
      params.odoEnd = $scope.trip.odoEnd;
    }

    bookingService.setTrip(params).then(function (booking) {
      alertService.add('success', $translate.instant('BOOKING.ADMINISTER.SAVE_SUCCESS'), 5000);
      $state.go('owm.person.dashboard');
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded();
    });
  };

})
;
