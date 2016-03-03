'use strict';

angular.module('owm.resource')

.directive('owResourceCard', function () {
  return {
    restrict: 'E',
    scope: {
      resource: '=',
      onSelect: '&'
    },
    templateUrl: 'resource/components/resource-card.tpl.html',
    controller: function ($scope) {
      $scope.select = function () {
        if ($scope.onSelect) {
          $scope.onSelect($scope.resource);
        }
      };
    }
  };
});
