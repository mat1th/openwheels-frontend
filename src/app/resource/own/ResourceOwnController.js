'use strict';

angular.module('owm.resource.own', [])

.controller('ResourceOwnController', function ($scope, $filter, $state, $translate, resources, resourceService, authService, alertService, dialogService) {
  $scope.resources = resources;

  $scope.setResourceAvailability = function (resource, value) {
    dialogService.showModal(null, {
      closeButtonText: $translate.instant('CLOSE'),
      actionButtonText: $translate.instant('OK'),
      headerText: $translate.instant('IS_AVAILABLE_RESOURCE_TITLE'),
      bodyText: $translate.instant('IS_AVAILABLE_RESOURCE')
    })
    .then(function () {
      resourceService.alter({
        resource: resource.id,
        newProps: {
          'isAvailableOthers': value,
          'isAvailableFriends': value
        }
      })
      .then(function () {
        alertService.add('success', $filter('translate')('IS_AVAILABLE_RESOURCE_SAVE_SUCCESS'), 3000);
        resource.isAvailableOthers = value;
        resource.isAvailableFriends = value;
      })
      .catch(function (err) {
        alertService.addError(err);
      })
      .finally(function () {
        alertService.loaded();
      });
    });
  };
});
