'use strict';

angular.module('filters.booking', [])

.filter('wantsToChangeBooking', function ($translate) {
  return function (name) {
    return name + ' ' + $translate.instant('BOOKING_TITLE_WANTS_TO_CHANGE');
  };
})

.filter('hasRented', function ($filter, $translate) {
  return function (name, resource) {
    var fallbackType = 'car';
    var resourceType = $filter('translateOrDefault')('RESOURCE_TYPE.' + (resource.type || '').toUpperCase(), fallbackType);
    var prefix = $translate.instant('BOOKING_TITLE_HAS_RENTED_PREFIX');
    var suffix = $translate.instant('BOOKING_TITLE_HAS_RENTED_SUFFIX');
    return [name, prefix, resourceType.toLowerCase(), suffix].join(' ');
  };
})

.filter('wantsToRent', function ($filter, $translate) {
  return function (name, resource) {
    var fallbackType = 'car';
    var resourceType = $filter('translateOrDefault')('RESOURCE_TYPE.' + (resource.type || '').toUpperCase(), fallbackType);
    var prefix = $translate.instant('BOOKING_TITLE_WANTS_TO_RENT_PREFIX');
    var suffix = $translate.instant('BOOKING_TITLE_WANTS_TO_RENT_SUFFIX');
    return [name, prefix, resourceType.toLowerCase(), suffix].join(' ');
  };
})
;
