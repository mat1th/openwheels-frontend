'use strict';

angular.module('owm.resource.create', [])

.controller('ResourceCreateController', function ($scope, $filter, $state, $translate, resources, resourceService, authService, alertService, dialogService, me) {
  $scope.resources = resources;
  $scope.me = me;

  $scope.save = function (resource) {
    var createResource = function() {
      return authService.me()
      .then(function (me) {
        resourceService.create({
          'owner': me.id,
          'registrationPlate': resource.registrationPlate
        }).then(function (resource) {
            alertService.add('success', $filter('translate')('RESOURCE_CREATED'), 3000);
            $state.go('owm.resource.edit', {'resourceId': resource.id});
          }, function (error) {
            alertService.add('danger', error.message, 5000);
          });
      });
    };

    //show dialog if user already has resources
    if(resources.length > 0) {
      dialogService.showModal(null, {
        closeButtonText: $translate.instant('CANCEL'),
        actionButtonText: $translate.instant('OK'),
        headerText: $translate.instant('CREATE_RESOURCE_TITLE'),
        bodyText: $translate.instant('ADD_MORE_THAN_ONE_RESOURCE')
      })
      .then(createResource);
    } else {
      createResource();
    }

  };

  $scope.isActiveResource = function (resource, value) {
    dialogService.showModal(null, {
      closeButtonText: $translate.instant('CANCEL'),
      actionButtonText: $translate.instant('OK'),
      headerText: $translate.instant('IS_ACTIVATE_RESOURCE_TITLE'),
      bodyText: $translate.instant('IS_ACTIVATE_RESOURCE')
    })
    .then(function () {
      resourceService.alter({
        resource: resource.id,
        newProps: {'isActive': value}
      });
    })
    .then(function () {
      alertService.addSaveSuccess();
      resource.isActive = value;
    }, function (error) {
      alertService.add('danger', error.message, 5000);
    });
  };

});
