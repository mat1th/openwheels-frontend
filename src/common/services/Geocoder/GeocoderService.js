'use strict';

angular.module('geocoder', ['ngStorage']).factory('Geocoder', function ($localStorage, $q, $timeout, $filter) {
  var locations = $localStorage.locations ? JSON.parse($localStorage.locations) : {};

  var queue = [];

  // Amount of time (in milliseconds) to pause between each trip to the
  // Geocoding API, which places limits on frequency.
  var queryPause = 250;

  /**
   * executeNext() - execute the next function in the queue.
   *                  If a result is returned, fulfill the promise.
   *                  If we get an error, reject the promise (with message).
   *                  If we receive OVER_QUERY_LIMIT, increase interval and try again.
   */
  var executeNext = function () {
    var task = queue[0],
      geocoder = new google.maps.Geocoder();

    var region = $filter('translateOrDefault')('SEARCH_COUNTRY', 'nl');
    var params = _.extend({address: task.address, region: region}, task.opt);
    geocoder.geocode(params, function (result, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        var geoLocations = [];
        angular.forEach(result, function(value, key){
          var location = {
            latlng: {
              latitude: value.geometry.location.lat(),
              longitude: value.geometry.location.lng()
            },
            address: value.formatted_address
          };
          geoLocations.push(location);
        });


        queue.shift();

        locations[task.address] = geoLocations;
        $localStorage.locations = JSON.stringify(locations);

        task.d.resolve(geoLocations);

        if (queue.length) {
          $timeout(executeNext, queryPause);
        }
      } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
        queue.shift();
        task.d.reject({
          type: 'zero',
          message: 'Zero results for geocoding address ' + task.address
        });
      } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
        queryPause += 250;
        $timeout(executeNext, queryPause);
      } else if (status === google.maps.GeocoderStatus.REQUEST_DENIED) {
        queue.shift();
        task.d.reject({
          type: 'denied',
          message: 'Request denied for geocoding address ' + task.address
        });
      } else if (status === google.maps.GeocoderStatus.INVALID_REQUEST) {
        queue.shift();
        task.d.reject({
          type: 'invalid',
          message: 'Invalid request for geocoding address ' + task.address
        });
      }
    });
  };

  return {
    latLngForAddress : function (address, options) {
      var d = $q.defer();

      if (_.has(locations, address)) {
        $timeout(function () {
          d.resolve(locations[address]);
        });
      } else {
        queue.push({
          address: address,
          d: d,
          opt: options
        });

        if (queue.length >= 1) {
          executeNext();
        }
      }

      return d.promise;
    }
  };
});
