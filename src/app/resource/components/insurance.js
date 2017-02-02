'use strict';

angular.module('owm.resource.insurance', [])
.directive('insurance', function ($compile) {
  return {
    restrict: 'E',
    scope: {
      resource: '='
    },
    templateUrl: 'resource/components/insurance.tpl.html',
    controller: 'InsuranceController'
  };
})
    
.controller('InsuranceController', function($scope, $log, resourceService, $state, $window) {

  $scope.changeInsurance = function () {
    resourceService.alter({resource: $scope.resource.id, newProps: {'insurancePolicy': 'CB_deelauto'} })
    .then(function (resource) {
      $window.open('https://www.centraalbeheer.nl/delen/auto-delen/Paginas/vereniging-gedeeld-autogebruik.aspx', '_blank');
    });

  };
  
});