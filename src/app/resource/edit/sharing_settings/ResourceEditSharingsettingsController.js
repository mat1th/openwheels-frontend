'use strict';

angular.module('owm.resource.edit.sharing_settings', [])

.controller('ResourceEditSharingSettingsController', function ($timeout, $translate, $scope, $filter, alertService, resourceService) {
  // expects to see $scope.$parent
  var resource = $scope.$parent.resource;

  var masterResource = resource;

  $scope.busy = false;

  $scope.cancel = function () {
    $scope.resource = angular.copy(masterResource);
    populateForm();
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

  $scope.availabilityOptions = [
    { label: $translate.instant('RESOURCE_AVAILABLE_ALWAYS'), value: 'ALWAYS' },
    { label: $translate.instant('RESOURCE_AVAILABLE_FRIENDS'), value: 'FRIENDS' },
    { label: $translate.instant('RESOURCE_AVAILABLE_NEVER'), value: 'NEVER' }
  ];

  $scope.confirmationOptions = [
    { label: $translate.instant('RESOURCE_CONFIRM_ALWAYS'), value: 'ALWAYS' },
    { label: $translate.instant('RESOURCE_CONFIRM_OTHERS'), value: 'OTHERS' },
    { label: $translate.instant('RESOURCE_CONFIRM_NEVER'), value: 'NEVER' }
  ];

  function populateForm () {
    $scope.userInput = {};

    $scope.userInput.available = (function () {
      if ($scope.resource.isAvailableFriends && $scope.resource.isAvailableOthers) {
        return 'ALWAYS';
      } else  if ($scope.resource.isAvailableFriends) {
        return 'FRIENDS';
      } else {
        return 'NEVER';
      }
    }());

    $scope.userInput.confirmationRequired = (function () {
      if ($scope.resource.isConfirmationRequiredFriends && $scope.resource.isConfirmationRequiredOthers) {
        return 'ALWAYS';
      } else if ($scope.resource.isConfirmationRequiredOthers) {
        return 'OTHERS';
      } else {
        return 'NEVER';
      }
    }());
  }

  $scope.save = function () {
    var newProps = $filter('returnDirtyItems')( angular.copy($scope.resource), $scope.editResourceForm);

    newProps.isAvailableFriends = ['ALWAYS', 'FRIENDS'].indexOf($scope.userInput.available) >= 0;
    newProps.isAvailableOthers  = $scope.userInput.available === 'ALWAYS';
    newProps.isConfirmationRequiredFriends = $scope.userInput.confirmationRequired === 'ALWAYS';
    newProps.isConfirmationRequiredOthers  = ['ALWAYS', 'OTHERS'].indexOf($scope.userInput.confirmationRequired) >= 0;

    if ($scope.resource.isAvailableFriends === newProps.isAvailableFriends) {
      delete newProps.isAvailableFriends;
    }
    if ($scope.resource.isAvailableOthers === newProps.isAvailableOthers) {
      delete newProps.isAvailableOthers;
    }
    if ($scope.resource.isConfirmationRequiredFriends === newProps.isConfirmationRequiredFriends) {
      delete newProps.isConfirmationRequiredFriends;
    }
    if ($scope.resource.isConfirmationRequiredOthers === newProps.isConfirmationRequiredOthers) {
      delete newProps.isConfirmationRequiredOthers;
    }

    alertService.load();
    $scope.busy = true;
    resourceService.alter({
      id: masterResource.id,
      newProps: newProps
    })
    .then(function (resource) {
      alertService.addSaveSuccess();
      masterResource = resource;
      $scope.cancel();
      $scope.editResourceForm.$setPristine();
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded();
      $scope.busy = false;
    });

  };
});
