(function () {
  'use strict';

  angular.module('owm.resource')

  .directive('owmResourceCard', function () {
    return {
      restrict: 'E',
      scope: {
        resource: '='
      },
      templateUrl: 'resource/components/resource-card.tpl.html',
      controller: ResourceCardController
    };
  });

  function ResourceCardController ($scope) {
    console.log($scope);
  }

}());
