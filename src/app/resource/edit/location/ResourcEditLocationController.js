'use strict';
angular.module('owm.resource.edit.location', [])
.controller('ResourceEditLocationController', function ($q, $filter, $timeout, alertService, resourceService, $scope) {

  var DEFAULT_LOCATION = { // Utrecht CS
    lat: 52.08950077150554,
    lng: 5.110294818878174
  };
  var masterResource = $scope.$parent.resource;

  $scope.map = {
    center   : {},
    control  : {},
    draggable: 'true',
    zoom     : 14,
    options  : {
      scrollwheel: false
    },
    events: {
      click: onMapClick
    },
    resourceMarker: {}
  };

  reset();

  function reset () {
    var r, loc;
    $scope.resource = angular.copy(masterResource);
    r = $scope.resource;
    if (r.latitude && r.longitude) {
      loc = { lat: r.latitude, lng: r.longitude };
      setMarker(loc);
      setCenter(loc);
    } else {
      setMarker(DEFAULT_LOCATION);
      setCenter(DEFAULT_LOCATION);
    }
  }

  $scope.reset = function () {
    reset();
    $scope.form.$setPristine();
  };

  $scope.submit = function () {
    var newProps = {
      location : $scope.resource.location,
      city     : $scope.resource.city,
      latitude : $scope.resource.latitude,
      longitude: $scope.resource.longitude
    };

    alertService.closeAll();
    alertService.load();
    resourceService.alter({
      resource: $scope.resource.id,
      newProps: newProps
    })
    .then(function (resource) {
      alertService.addSaveSuccess();
      angular.extend(masterResource, resource);
      $scope.reset();
    })
    .catch(function (err) {
      if (err && err.level && err.message) {
        alertService.add(err.level, err.message, 5000);
      } else {
        alertService.addGenericError();
      }
    })
    .finally(function () {
      alertService.loaded();
    });
  };

  $scope.$on('collapseContainerVisible', function () {
    $scope.map.control.refresh();
    $timeout(function () {
      var r = $scope.resource;
      if (r.latitude && r.longitude) {
        setCenter({ lat: r.latitude, lng: r.longitude });
      } else {
        setCenter(DEFAULT_LOCATION);
      }
    }, 0);
  });

  function onMapClick (maps, eventName, args) {
    var latLng, lat, lng;
    if (args.length) {
      latLng = args[0].latLng;
      lat = latLng.lat();
      lng = latLng.lng();

      $scope.resource.latitude = lat;
      $scope.resource.longitude = lng;

      setMarker({ lat: lat, lng: lng });
      reverseGeocode({ lat: lat, lng: lng }).then(function (address) {
        angular.extend($scope.resource, {
          location: address.route + ' ' + address.streetNumber,
          city: address.city
        });
        $scope.form.$setDirty();
      });
    }
  }

  function setMarker (location) {
    $scope.map.resourceMarker.latitude = location.lat;
    $scope.map.resourceMarker.longitude = location.lng;
  }

  function setCenter (location) {
    $scope.map.center = {
      latitude : location.lat,
      longitude: location.lng
    };
  }

  function reverseGeocode (location) {
    var dfd = $q.defer();
    var geocoder = new google.maps.Geocoder();
    var latLng = new google.maps.LatLng(location.lat, location.lng);
    var ac, address = {
      route: '',
      streetNumber: '',
      city: ''
    };

    geocoder.geocode({ latLng: latLng }, function (results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results.length) {
          ac = results[0].address_components;

          for (var i = 0; i < ac.length; i++) {
            if (ac[i].types[0] === 'route') {
              address.route = ac[i].long_name;
            }
            if (ac[i].types[0] === 'street_number') {
              address.streetNumber = ac[i].long_name;
            }
            if (ac[i].types[0] === 'locality') {
              address.city = ac[i].long_name;
            }
          }
          dfd.resolve(address);
        }
      }
    });
    return dfd.promise;
  }

});
