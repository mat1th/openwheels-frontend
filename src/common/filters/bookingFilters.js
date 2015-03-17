'use strict';

angular.module('filters.booking', [])

.filter('bookingRequestedOwner', ['$translate', function ($translate) {
  var keys = {
    car   : 'BOOKING_REQUESTED_OWNER_CAR',
    cabrio: 'BOOKING_REQUESTED_OWNER_CABRIO',
    camper: 'BOOKING_REQUESTED_OWNER_CAMPER',
    van   : 'BOOKING_REQUESTED_OWNER_VAN'
  };
  return function (booking) {
    var key = keys[booking.resource.type] || keys.car;
    return $translate.instant(key).toLowerCase();
  };
}])

.filter('bookingAcceptedOwner', ['$translate', function ($translate) {
  var keys = {
    car   : 'BOOKING_ACCEPTED_OWNER_CAR',
    cabrio: 'BOOKING_ACCEPTED_OWNER_CABRIO',
    camper: 'BOOKING_ACCEPTED_OWNER_CAMPER',
    van   : 'BOOKING_ACCEPTED_OWNER_VAN'
  };
  return function (booking) {
    var key = keys[booking.resource.type] || keys.car;
    return $translate.instant(key).toLowerCase();
  };
}]);
