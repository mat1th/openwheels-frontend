'use strict';

angular.module('filters.bookingStatus', [])

.filter('bookingStatus', ['$translate', function ($translate) {
  var keys = {
    requested : 'BOOKING_STATUS_REQUESTED',
    accepted  : 'BOOKING_STATUS_ACCEPTED',
    rejected  : 'BOOKING_STATUS_REJECTED',
    cancelled : 'BOOKING_STATUS_CANCELED'
  };
  return function (status) {
    return $translate.instant(keys[status]);
  };
}]);
