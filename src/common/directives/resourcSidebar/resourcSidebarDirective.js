'use strict';

angular.module('resourceSidebarDirective', [])

.directive('resourceSidebar', function () {
  return {
    restrict: 'A',
    scope: {
      data: '@'
    },
    replace: true,
    templateUrl: 'directives/resourcSidebar/resourcSidebar.tpl.html',
    controller: function ($stateParams, $scope, resourceService, windowSizeService, FRONT_DATE_FORMAT) {
      var city = $stateParams.city,
        resourceId = $stateParams.resourceId,
        discountCode = $stateParams.discountCode;
        
      $scope.startTime = moment($stateParams.startTime).format(FRONT_DATE_FORMAT);
      $scope.endTime = moment($stateParams.endTime).format(FRONT_DATE_FORMAT);

      $scope.resource = {};
      resourceService.get({
          'resource': resourceId
        })
        .then(function (res) {
          $scope.resource = res;
        });
    }
  };
});
