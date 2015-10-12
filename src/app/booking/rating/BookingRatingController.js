'use strict';

angular.module('owm.booking.rating', [])

/*
 * @param {string} userPerspective - 'renter' | 'owner'
 */
.controller('BookingRatingController', function ($log, $scope, $state, $translate, alertService, ratingService, booking, rating, userPerspective) {

  $scope.booking  = booking;
  $scope.resource = booking.resource;
  $scope.rating   = rating;
  $scope.userPerspective = userPerspective;

  // rating defaults
  $scope.rating.satisfaction = rating.satisfaction; // nullable boolean (see fix below)
  $scope.rating.quality      = rating.quality || 0;
  $scope.rating.cleanliness  = rating.cleanliness || 0;

  // fix api not returning nullable boolean
  if ( !(rating.satisfaction === false || rating.satisfaction === true || rating.satisfaction === null) ) {
    $log.debug('WARNING: api returned rating.satisfaction=' + rating.satisfaction + ' (should be nullable boolean)');
  }
  if (rating.satisfaction === 1 || rating.satisfaction === true) {
    $scope.rating.satisfaction = true;
  }
  else if (rating.satisfaction === 0 || rating.satisfaction === false) {
    $scope.rating.satisfaction = false;
  }
  else {
    $scope.rating.satisfaction = null;
  }

  $scope.submit = function () {

    // set quality 0 to null
    if ($scope.rating.quality === 0) {
      $scope.rating.quality = null;
    }

    // set cleanliness 0 to null
    if ($scope.rating.cleanliness === 0) {
      $scope.rating.cleanliness = null;
    }

    var data = {
      satisfaction: $scope.rating.satisfaction,
      review      : $scope.rating.review
    };

    switch ($scope.userPerspective) {
      case 'owner':
        break;
      case 'renter':
        data.quality     = $scope.rating.quality;
        data.cleanliness = $scope.rating.cleanliness;
        break;
    }

    alertService.load();
    ratingService.create({
      trip: booking.trip.id,
      other: data
    })
    .then(function (result) {
      alertService.add('success', $translate.instant('BOOKING.RATING.SAVE_SUCCESS'), 5000);
      $state.go('owm.person.dashboard');
    })
    .catch(function () {
      alertService.addGenericError();
    })
    .finally(function () {
      alertService.loaded();
    });
  };

  $scope.satisfactionText = function () {
    switch ($scope.rating.satisfaction) {
      case false:
        return $translate.instant('BOOKING.RATING.SATISFACTION.0');
      case null:
        return $translate.instant('BOOKING.RATING.SATISFACTION.NULL');
      case true:
        return $translate.instant('BOOKING.RATING.SATISFACTION.1');
    }
  };

  $scope.qualityText = function () {
    switch ($scope.rating.quality) {
      case 0:
        return $translate.instant('BOOKING.RATING.QUALITY.0');
      case 1:
        return $translate.instant('BOOKING.RATING.QUALITY.1');
      case 2:
        return $translate.instant('BOOKING.RATING.QUALITY.2');
      case 3:
        return $translate.instant('BOOKING.RATING.QUALITY.3');
      case 4:
        return $translate.instant('BOOKING.RATING.QUALITY.4');
      case 5:
        return $translate.instant('BOOKING.RATING.QUALITY.5');
    }
  };

  $scope.cleanlinessText = function () {
    switch ($scope.rating.cleanliness) {
      case 0:
        return $translate.instant('BOOKING.RATING.CLEANLINESS.0');
      case 1:
        return $translate.instant('BOOKING.RATING.CLEANLINESS.1');
      case 2:
        return $translate.instant('BOOKING.RATING.CLEANLINESS.2');
      case 3:
        return $translate.instant('BOOKING.RATING.CLEANLINESS.3');
      case 4:
        return $translate.instant('BOOKING.RATING.CLEANLINESS.4');
      case 5:
        return $translate.instant('BOOKING.RATING.CLEANLINESS.5');
    }
  };

  $scope.starValues = [1,2,3,4,5];
  $scope.starClass = function (propName, starValue) {
    return $scope.rating[propName] >= starValue ? 'fa fa-2x fa-star text-warning' : 'fa fa-2x fa-star-o text-muted';
  };

})
;
