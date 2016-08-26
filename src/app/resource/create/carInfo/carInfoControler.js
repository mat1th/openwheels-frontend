'use strict';

angular.module('owm.resource.create.carInfo', [])

.controller('carInfoControler', function ($scope, $filter, $state, $log, $q, $stateParams, $translate, resources, resourceService, authService, alertService, dialogService, me) {
  var resource = $scope.resource;
  var masterResource = resource;
  var masterResourceProperties = createResourceProperties(resource);

  $scope.radiusOptions = [{
    value: undefined,
    label: ''
  }, {
    value: 1000,
    label: '< 1 km'
  }, {
    value: 5000,
    label: '< 5 km'
  }, {
    value: 10000,
    label: '< 10 km'
  }, {
    value: 25000,
    label: '< 25 km'
  }, {
    value: 50000,
    label: '< 50 km'
  }];

  $scope.minSeatOptions = [{
    value: undefined,
    label: ''
  }, {
    value: 1,
    label: 1
  }, {
    value: 2,
    label: 2
  }, {
    value: 3,
    label: 3
  }, {
    value: 4,
    label: 4
  }, {
    value: 5,
    label: 5
  }, {
    value: 6,
    label: 6
  }, {
    value: 7,
    label: 7
  }, {
    value: 8,
    label: 8
  }, {
    value: 9,
    label: 9
  }, {
    value: 10,
    label: 10
  }];

  $scope.fuelTypeOptions = [{
    value: undefined,
    label: $translate.instant('FUEL_TYPE.ALL')
  }, {
    value: 'benzine',
    label: $translate.instant('FUEL_TYPE.BENZINE')
  }, {
    value: 'diesel',
    label: $translate.instant('FUEL_TYPE.DIESEL')
  }, {
    value: 'lpg',
    label: $translate.instant('FUEL_TYPE.LPG')
  }, {
    value: 'elektrisch',
    label: $translate.instant('FUEL_TYPE.ELECTRIC')
  }, {
    value: 'hybride',
    label: $translate.instant('FUEL_TYPE.HYBRID')
  }, {
    value: 'cng',
    label: $translate.instant('FUEL_TYPE.CNG')
  }];

  $scope.resourceTypeOptions = [{
    value: undefined,
    label: $translate.instant('RESOURCE_TYPE.ALL')
  }, {
    value: 'car',
    label: $translate.instant('RESOURCE_TYPE.CAR')
  }, {
    value: 'cabrio',
    label: $translate.instant('RESOURCE_TYPE.CABRIO')
  }, {
    value: 'camper',
    label: $translate.instant('RESOURCE_TYPE.CAMPER')
  }, {
    value: 'van',
    label: $translate.instant('RESOURCE_TYPE.VAN')
  }, {
    value: 'oldtimer',
    label: $translate.instant('RESOURCE_TYPE.OLDTIMER')
  }];

  $scope.resourcePropertyOptions = [{
    value: 'airconditioning',
    label: $translate.instant('ACCESSORIES.AIRCONDITIONING')
  }, {
    value: 'automaat',
    label: $translate.instant('ACCESSORIES.AUTOMATICTRANSMISSION')
  }, {
    value: 'fietsendrager',
    label: $translate.instant('ACCESSORIES.BIKE_CARRIER')
  }, {
    value: 'kinderzitje',
    label: $translate.instant('ACCESSORIES.CHILD_SEAT')
  }, {
    value: 'mp3-aansluiting',
    label: $translate.instant('ACCESSORIES.MP3_CONNECTION')
  }, {
    value: 'navigatie',
    label: $translate.instant('ACCESSORIES.NAVIGATION')
  }, {
    value: 'rolstoelvriendelijk',
    label: $translate.instant('ACCESSORIES.WHEELCHAIR_FRIENDLY')
  }, {
    value: 'trekhaak',
    label: $translate.instant('ACCESSORIES.TOW_BAR')
  }, {
    value: 'winterbanden',
    label: $translate.instant('ACCESSORIES.WINTER_TIRES')
  }];

  $scope.disabledFields = (function () {
    return {
      registrationPlate: true,
      brand: false,
      model: false,
      color: false,
      numberOfSeats: false,
      fuelType: false,
      resourceType: false
    };
  }());
  $scope.cancel = function () {
    $scope.resource = angular.copy(masterResource);
    $scope.resourceProperties = angular.copy(masterResourceProperties);
  };

  $scope.cancel();

  $scope.save = function () {
    var newProps = $filter('returnDirtyItems')(angular.copy($scope.resource), $scope.editResourceForm, ['location', 'city', 'latitude', 'longitude']);
    $log.debug(newProps);
    alertService.load();
    resourceService.alter({
        resource: resource.id,
        newProps: newProps
      })
      .then(function (resource) {
        if (!angular.equals($scope.resourceProperties, masterResourceProperties)) {
          return saveResourceProperties().then(function () {

            return resource;
          });
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


  function createResourceProperties(resource) {
    var resourceProperties = {};
    angular.forEach(resource.properties, function (resourceProperty) {
      resourceProperties[resourceProperty.id] = true;
    });
    return resourceProperties;
  }

  function saveResourceProperties() {
    var pending = [];
    angular.forEach($scope.resourceProperties, function (value, propertyName) {
      if (value === true && !masterResourceProperties[propertyName]) {
        pending.push(resourceService.addProperty({
          resource: resource.id,
          property: propertyName
        }));
      }
      $log.debug(propertyName);
      if (value === false && masterResourceProperties[propertyName]) {
        pending.push(resourceService.removeProperty({
          resource: resource.id,
          property: propertyName
        }));
      }
    });
    return $q.all(pending);
  }
});
