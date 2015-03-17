'use strict';

angular.module('owm.geoPositionService', [])

.factory('geoPositionService', function ($q, $window) {

  var asyncPosition = $q.defer();

  var position = {
    isWatching : false,
    isResolved : false,
    coordinates: null,
    geoUri     : null
  };

  var positionOptions = {
    maximumAge: 0
  };

  var supported = $window.navigator && $window.navigator.geolocation;
  if (!supported) {
    position.isWatching = false;
    position.isResolved = true;
    asyncPosition.reject();
  }

  // Public
  function getGeoPosition () {
    if (supported && !position.isWatching) { startWatching(); }
    return asyncPosition.promise;
  }

  function startWatching () {
    position.isWatching = true;
    $window.navigator.geolocation.watchPosition(onPosition, onPositionError, positionOptions);
  }

  function onPosition (pos) {
    position.coordinates = {
      latitude  : pos.coords.latitude,
      longitude : pos.coords.longitude,
      accuracy  : pos.coords.accuracy
    };
    position.geoUri = 'geo:' + position.coordinates.latitude + ',' + position.coordinates.longitude;

    if (!position.isResolved) {
      position.isResolved = true;
      asyncPosition.resolve(position);
    }
  }

  function onPositionError () {
    if (!position.isResolved) {
      position.isResolved = true;
      asyncPosition.resolve(position);
    }
  }

  return {
    position      : position,
    getGeoPosition: getGeoPosition
  };

})
;
