'use strict';

angular.module('owm.resource.filter', [])

  .controller('ResourceFilterController', function ($scope, $stateParams, $uibModalInstance, $translate, props, filters, options) {
    $scope.props   = props; // .radius, ...
    $scope.filters = filters;
    $scope.options = options;

    $scope.radiusOptions = [
      { value: undefined, label: '' },
      { value:  1000, label: '< 1 km' },
      { value:  5000, label: '< 5 km' },
      { value: 10000, label: '< 10 km' },
      { value: 25000, label: '< 25 km' },
      { value: 50000, label: '< 50 km' }
    ];

    $scope.minSeatOptions = [
      {value: undefined, label: '' },
      {value: 1, label: 1},
      {value: 2, label: 2},
      {value: 3, label: 3},
      {value: 4, label: 4},
      {value: 5, label: 5},
      {value: 6, label: 6},
      {value: 7, label: 7},
      {value: 8, label: 8},
      {value: 9, label: 9},
      {value: 10, label: 10}
    ];

    $scope.fuelTypeOptions = [
      {value: undefined, label: $translate.instant('FUEL_TYPE.ALL')},
      {value: 'benzine', label: $translate.instant('FUEL_TYPE.BENZINE')},
      {value: 'diesel', label: $translate.instant('FUEL_TYPE.DIESEL')},
      {value: 'lpg', label: $translate.instant('FUEL_TYPE.LPG')},
      {value: 'elektrisch', label: $translate.instant('FUEL_TYPE.ELECTRIC')},
      {value: 'hybride', label: $translate.instant('FUEL_TYPE.HYBRID')},
      {value: 'cng', label: $translate.instant('FUEL_TYPE.CNG')}
    ];

    $scope.resourceTypeOptions = [
      {value: undefined, label: $translate.instant('RESOURCE_TYPE.ALL')},
      {value: 'car', label: $translate.instant('RESOURCE_TYPE.CAR')},
      {value: 'cabrio', label: $translate.instant('RESOURCE_TYPE.CABRIO')},
      {value: 'camper', label: $translate.instant('RESOURCE_TYPE.CAMPER')},
      {value: 'van', label: $translate.instant('RESOURCE_TYPE.VAN')},
      {value: 'oldtimer', label: $translate.instant('RESOURCE_TYPE.OLDTIMER')}
    ];

    $scope.optionsLabels = {
      'airconditioning':     $translate.instant('ACCESSORIES.AIRCONDITIONING'),
      'fietsendrager':       $translate.instant('ACCESSORIES.BIKE_CARRIER'),
      'winterbanden':        $translate.instant('ACCESSORIES.WINTER_TIRES'),
      'kinderzitje':         $translate.instant('ACCESSORIES.CHILD_SEAT'),
      'navigatie':           $translate.instant('ACCESSORIES.NAVIGATION'),
      'trekhaak':            $translate.instant('ACCESSORIES.TOW_BAR'),
      'automaat':            $translate.instant('ACCESSORIES.AUTOMATICTRANSMISSION'),
      'mp3-aansluiting':     $translate.instant('ACCESSORIES.MP3_CONNECTION'),
      'rolstoelvriendelijk': $translate.instant('ACCESSORIES.WHEELCHAIR_FRIENDLY')
    };

    $scope.ok = function () {
      $uibModalInstance.close({filters: $scope.filters, options: $scope.options, props: $scope.props });
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  })

;
