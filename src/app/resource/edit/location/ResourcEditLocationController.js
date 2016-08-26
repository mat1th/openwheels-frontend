'use strict';
angular.module('owm.resource.edit.location', ['geocoderDirective'])
  .controller('ResourceEditLocationController', function ($q, $filter, $timeout, alertService, personService, resourceService, $scope, $state) {
    
    $scope.ownerflow = $state.current.name === 'owm.resource.create.location' ? true : false;
    $scope.locationtext = null;

    var DEFAULT_LOCATION = { // Utrecht CS
      lat: 52.08950077150554,
      lng: 5.110294818878174
    };
    var masterResource = $scope.$parent.resource;

    $scope.map = {
      center: {},
      control: {},
      draggable: 'true',
      zoom: 14,
      options: {
        scrollwheel: false
      },
      events: {
        click: onMapClick
      },
      resourceMarker: {}
    };

    reset();

    function reset() {
      var r, loc;
      $scope.resource = angular.copy(masterResource);
      r = $scope.resource;
      if (r.latitude && r.longitude) {
        loc = {
          lat: r.latitude,
          lng: r.longitude
        };
        setMarker(loc);
        setCenter(loc);
        updateLocationText();
      } else {
        setMarker(DEFAULT_LOCATION);
        setCenter(DEFAULT_LOCATION);
      }
    }

    $scope.reset = function () {
      reset();
      // $scope.locationForm.$setPristine();
    };

    $scope.submit = function () {
      var newProps = {
        location: $scope.resource.location,
        city: $scope.resource.city,
        latitude: $scope.resource.latitude,
        longitude: $scope.resource.longitude
      };

      alertService.closeAll();
      alertService.load();
      resourceService.alter({
          resource: $scope.resource.id,
          newProps: newProps
        })
        .then(function (resource) {
          if (!$scope.ownerflow) {
            alertService.addSaveSuccess();
          }
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
      if ($scope.ownerflow) {
        setPersonLocation();
      }
    };
    var setPersonLocation = function () {
      personService.alter({
        person: $scope.me.id,
        newProps: {
          city: $scope.me.city,
          streetName: $scope.me.streetName,
          streetNumber: $scope.me.streetNumber
        }
      });
    };

    $scope.$on('collapseContainerVisible', function () {
      $scope.map.control.refresh();
      $timeout(function () {
        var r = $scope.resource;
        if (r.latitude && r.longitude) {
          setCenter({
            lat: r.latitude,
            lng: r.longitude
          });
        } else {
          setCenter(DEFAULT_LOCATION);
        }
      }, 0);
    });

    $scope.newLocationSelectedDropdown = function (a) {
      var address = parseAddressComponents(a.address_components);
      $scope.resource.city = address.city;
      $scope.resource.location = address.route + ' ' + address.streetNumber;
      $scope.resource.latitude = a.geometry.location.lat();
      $scope.resource.longitude = a.geometry.location.lng();
      if ($scope.ownerflow) { //if in the ownerflow
        //set me
        $scope.me.city = address.city;
        $scope.me.streetName = address.route;
        $scope.me.streetNumber = address.streetNumber;
      }
      setMarker({
        lat: $scope.resource.latitude,
        lng: $scope.resource.longitude
      });
      setCenter({
        lat: $scope.resource.latitude,
        lng: $scope.resource.longitude
      });
      $scope.locationForm.$setDirty();
    };

    function onMapClick(maps, eventName, args) {
      var latLng, lat, lng;
      if (args.length) {
        latLng = args[0].latLng;
        lat = latLng.lat();
        lng = latLng.lng();
        $scope.resource.latitude = lat;
        $scope.resource.longitude = lng;

        setMarker({
          lat: lat,
          lng: lng
        });
        reverseGeocode({
          lat: lat,
          lng: lng
        }).then(function (address) {
          angular.extend($scope.resource, {
            location: address.route + ' ' + address.streetNumber,
            city: address.city
          });

          if ($scope.ownerflow) { //if in the ownerflow
            //set me
            $scope.me.city = address.city;
            $scope.me.streetName = address.route;
            $scope.me.streetNumber = address.streetNumber;
          }
          $scope.locationForm.$setDirty();
        });
      }
    }

    function setMarker(location) {
      $scope.map.resourceMarker.latitude = location.lat;
      $scope.map.resourceMarker.longitude = location.lng;
    }

    function setCenter(location) {
      $scope.map.center = {
        latitude: location.lat,
        longitude: location.lng
      };
    }

    function parseAddressComponents(ac) {
      var address = {
        route: '',
        streetNumber: '',
        city: ''
      };

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
      return address;
    }

    function reverseGeocode(location) {
      var dfd = $q.defer();
      var geocoder = new google.maps.Geocoder();
      var latLng = new google.maps.LatLng(location.lat, location.lng);
      var ac, address = {
        route: '',
        streetNumber: '',
        city: ''
      };

      geocoder.geocode({
        latLng: latLng
      }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results.length) {
            address = parseAddressComponents(results[0].address_components);
            $scope.resource.city = address.city;
            $scope.resource.location = address.route + ' ' + address.streetNumber;

            updateLocationText();
            dfd.resolve(address);
          }
        }
      });
      return dfd.promise;
    }

    function updateLocationText() {
      if ($scope.resource.location || $scope.resource.city) {
        $scope.locationtext = $scope.resource.location + ', ' + $scope.resource.city;
      }
    }
  });
