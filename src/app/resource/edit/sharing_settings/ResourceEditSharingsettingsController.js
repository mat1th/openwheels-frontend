'use strict';

angular.module('owm.resource.edit.sharing_settings', [])


.controller('ResourceEditSharingSettingsController', function ($timeout, $scope, $filter, alertService, resourceService) {
  // expects to see $scope.$parent
  var resource = $scope.$parent.resource;

  var masterResource = resource;

  $scope.cancel = function () {
    $scope.resource = angular.copy(masterResource);
  };
  $scope.cancel();

  $scope.fuelTypeOptions = [
    {label: 'Benzine', value: 'benzine'},
    {label: 'Diesel', value: 'diesel'},
    {label: 'Elektrisch', value: 'elektrisch'},
    {label: 'Hybride', value: 'hybride'},
    {label: 'Lpg', value: 'lpg'},
    {label: 'Other', value: 'other'}
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
    {label: 'Car', value: 'car'},
    {label: 'Bike', value: 'bike'},
    {label: 'Boat', value: 'boat'},
    {label: 'Scooter', value: 'scooter'}
  ];

  $scope.minimumAgeOptions = (function () {
    var options = [
      { label: '', value: '' }
    ];
    for (var i = 18; i <= 40; i++) {
      options.push({ label: i + '', value: i });
    }
    return options;
  }());

  $scope.allowedAreaOptions = (function () {
    var options = [
      { label: 'Europa', value: 'Europa' },
      { label: 'Nederland', value: 'Nederland' }
    ];
    if (resource.providerId !== 21) {
      options.push({ label: 'België', value: 'België' });
    }
    return options;
  }());

  $scope.save = function () {
    alertService.load();
    var newProps = $filter('returnDirtyItems')( angular.copy($scope.resource), $scope.editResourceForm);
    resourceService.alter({
      id: masterResource.id,
      newProps: newProps
    })
    .then(function (resource) {
      alertService.addSaveSuccess();
      masterResource = resource;
      $scope.cancel();
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded();
    });
  };
});
