'use strict';

angular.module('owm.resource.edit', [
  'owm.resource.edit.data',
  'owm.resource.edit.sharing_settings',
  'owm.resource.edit.price',
  'owm.resource.edit.members',
  'owm.resource.edit.location',
  'owm.resource.edit.pictures'
])

.controller('ResourceEditController', function ($timeout, $state, $scope, me, resource, members) {

  // PERMISSION CHECK
  // Redirect if not owner or contactperson
  $scope.hasPermission = false;
  if (resource.owner.id !== me.id && resource.contactPerson.id !== me.id) {
    $state.go('owm.resource.show', { resourceId: resource.id, city: resource.city });
  } else {
    $scope.hasPermission = true;
  }

  $scope.resource = resource;
  $scope.members  = members;
  $scope.isLocationCollapsed = true;

  $scope.toggleLocation = function () {
    $scope.isLocationCollapsed = !!!$scope.isLocationCollapsed;
    if (!$scope.isLocationCollapsed) {
      // notify google maps to redraw itself when container is fully expanded
      $timeout(function () {
        $scope.$broadcast('collapseContainerVisible');
      }, 0);
    }
  };

})
;
