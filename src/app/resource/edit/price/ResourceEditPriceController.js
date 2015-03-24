'use strict';

angular.module('owm.resource.edit.price', [])

.controller('ResourceEditPriceController', function ($filter, $scope, alertService, resourceService) {

  // Require $scope.resource
  var master = $scope.resource;

  // Work on a copy
  $scope.resource = angular.copy(master);

  $scope.save = function () {
    alertService.load();
    var newProps = $filter('returnDirtyItems')(angular.copy($scope.resource), $scope.form);
    resourceService.alter({
      id: $scope.resource.id,
      newProps: newProps
    })
    .then(function (resource) {
      alertService.addSaveSuccess();

      // Update master
      angular.forEach(newProps, function (value, key) {
        master[key] = resource[key];
      });

      // Update working copy
      reset();
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded();
    });
  };

  $scope.reset = reset;

  function reset () {
    $scope.resource = angular.copy(master);
    $scope.form.$setPristine();
  }

});
