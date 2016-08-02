'use strict';

angular.module('owm.resource.edit.data', [])

.controller('ResourceEditDataController', function ($q, $scope, $filter, $translate, alertService, resourceService) {

  // expects to see $scope.$parent
  var resource = $scope.$parent.resource;
  var masterResource = resource;
  var masterResourceProperties = createResourceProperties(resource);

  $scope.searchPlace = {};

  function createResourceProperties (resource) {
    var resourceProperties = {};
    angular.forEach(resource.properties, function (resourceProperty) {
      resourceProperties[resourceProperty.id] = true;
    });
    return resourceProperties;
  }

  $scope.cancel = function () {
    $scope.resource = angular.copy(masterResource);
    $scope.resourceProperties = angular.copy(masterResourceProperties);
  };

  $scope.cancel();

  var resetCenter = function() {
    $scope.map.center = {
      latitude: $scope.resource.latitude || 52.5575,
      longitude: $scope.resource.longitude || 5.6500
    };
    $scope.map.resourceMarker = {
      latitude: $scope.resource.latitude || null,
      longitude: $scope.resource.longitude || null
    };
  };

  $scope.fuelTypeOptions = [
    {value: 'benzine'   , label: $translate.instant('FUEL_TYPE.BENZINE')},
    {value: 'diesel'    , label: $translate.instant('FUEL_TYPE.DIESEL')},
    {value: 'lpg'       , label: $translate.instant('FUEL_TYPE.LPG')},
    {value: 'elektrisch', label: $translate.instant('FUEL_TYPE.ELECTRIC')},
    {value: 'hybride'   , label: $translate.instant('FUEL_TYPE.HYBRID')},
    {value: 'cng'       , label: $translate.instant('FUEL_TYPE.CNG')},
  ];

  $scope.locktypeOptions = [
    {label: 'Afspraak maken', value: 'meeting'},
    {label: 'Sleutelkluis', value: 'locker'},
    {label: 'Chipcard', value: 'chipcard'},
    {label: 'Smartphone', value: 'smartphone'}
  ];

  $scope.insurancePolicyOptions = [
    {label: 'CB deelauto', value: 'CB_deelauto'},
    {label: 'CB normaal', value: 'CB'},
    {label: 'Deelauto OK', value: 'deelauto_OK'},
    {label: 'Elders', value: 'elders'}
  ];

  $scope.resourceTypeOptions = [
    {value: 'car'   , label: $translate.instant('RESOURCE_TYPE.CAR')},
    {value: 'cabrio', label: $translate.instant('RESOURCE_TYPE.CABRIO')},
    {value: 'camper', label: $translate.instant('RESOURCE_TYPE.CAMPER')},
    {value: 'oldtimer', label: $translate.instant('RESOURCE_TYPE.OLDTIMER')},
    {value: 'van'   , label: $translate.instant('RESOURCE_TYPE.VAN')}
  ];

  $scope.numberOfSeatsOptions = [
    {value: 2   , label: '2'},
    {value: 3   , label: '3'},
    {value: 4   , label: '4'},
    {value: 5   , label: '5'},
    {value: 6   , label: '6'},
    {value: 7   , label: '7'},
    {value: 8   , label: '8'},
    {value: 9   , label: '9'}
  ];

  $scope.resourcePropertyOptions = [
    { value: 'airconditioning'    , label: $translate.instant('ACCESSORIES.AIRCONDITIONING') },
    { value: 'automaat'           , label: $translate.instant('ACCESSORIES.AUTOMATICTRANSMISSION') },
    { value: 'fietsendrager'      , label: $translate.instant('ACCESSORIES.BIKE_CARRIER') },
    { value: 'kinderzitje'        , label: $translate.instant('ACCESSORIES.CHILD_SEAT') },
    { value: 'mp3-aansluiting'    , label: $translate.instant('ACCESSORIES.MP3_CONNECTION') },
    { value: 'navigatie'          , label: $translate.instant('ACCESSORIES.NAVIGATION') },
    { value: 'rolstoelvriendelijk', label: $translate.instant('ACCESSORIES.WHEELCHAIR_FRIENDLY') },
    { value: 'trekhaak'           , label: $translate.instant('ACCESSORIES.TOW_BAR') },
    { value: 'winterbanden'       , label: $translate.instant('ACCESSORIES.WINTER_TIRES') }
  ];

  //google maps places config
  $scope.completePlacesOptions = {
    country: 'nl',
    watchEnter: true
  };

  //update resource properties als een plaats is gevonden
  $scope.$watch('searchPlace.details', function(newVal, oldVal) {
    if(newVal === oldVal) {
      return;
    }

    var ac = $scope.searchPlace.details.address_components;
    var address={};
    for(var i=0; i<ac.length; ++i) {
      if(ac[i].types[0] === 'route') {
        address.route = ac[i].long_name;
      }
      if(ac[i].types[0] === 'street_number') {
        address.streetNumber = ac[i].long_name;
      }
      if(ac[i].types[0] === 'locality') {
        address.city = ac[i].long_name;
      }
    }
    if(! (address.route && address.streetNumber && address.city) ) {
      return alertService.add('danger', 'Please select a full address: including a street name, street number and city', 3000);
    }

    //set new values on scope
    $scope.resource.location = address.route + ' ' + address.streetNumber;
    $scope.resource.city = address.city;
    $scope.resource.latitude = $scope.searchPlace.details.geometry.location.lat();
    $scope.resource.longitude = $scope.searchPlace.details.geometry.location.lng();
  });

  //reset map center als een nieuwe locatie is geselecteerd
  $scope.$watch('[resource.latitude, resource.longitude]', function() {
    resetCenter();
  }, true);

  //map config (default center to utrecht)
  angular.extend($scope, {
    map: {
      center: {
        latitude: $scope.resource.latitude || 52.091515,
        longitude: $scope.resource.longitude || 5.107183
      },
      draggable: 'true',
      zoom: 14,
      options: {
        scrollwheel: false
      },
      resourceMarker: {
        latitude: $scope.resource.latitude || null,
        longitude: $scope.resource.longitude || null,
        title: $scope.resource.alias
      }
    }
  });

  $scope.save = function () {
    var newProps = $filter('returnDirtyItems')( angular.copy($scope.resource), $scope.editResourceForm, ['location', 'city', 'latitude', 'longitude']);

    alertService.load();
    resourceService.alter({
      resource: resource.id,
      newProps: newProps
    })
    .then(function (resource) {
      if (!angular.equals($scope.resourceProperties, masterResourceProperties)) {
        return saveResourceProperties().then(function () { return resource; });
      } else {
        return resource;
      }
    })
    .then(function (resource) {
      alertService.addSaveSuccess();
      masterResource = resource;
      masterResourceProperties = $scope.resourceProperties;
      $scope.cancel();
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded();
    });
  };

  function saveResourceProperties () {
    var pending = [];
    angular.forEach($scope.resourceProperties, function (value, propertyName) {
      if (value === true && !masterResourceProperties[propertyName]) {
        pending.push(resourceService.addProperty({
          resource: resource.id,
          property: propertyName
        }));
      }
      if (value === false && masterResourceProperties[propertyName]) {
        pending.push(resourceService.removeProperty({
          resource: resource.id,
          property: propertyName
        }));
      }
    });
    return $q.all(pending);
  }

  $scope.disabledFields = (function () {
    return {
      registrationPlate: true,
      brand            : false,
      model            : false,
      color            : false,
      numberOfSeats    : false,
      fuelType         : false,
      resourceType     : false
    };
  }());

});
