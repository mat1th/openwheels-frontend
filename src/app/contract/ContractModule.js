'use strict';
angular.module('owm.contract', [])

.config(function($stateProvider) {
  $stateProvider.state('contractchoice', {
    url: '/contractkeuze',
    parent: 'owm',
    views: {
      'main@shell': {
        templateUrl: 'contract/contractchoice.tpl.html',
        controller: 'ContractChoiceController'
      }
    },
    data: {
      denyAnonymous: true
    },
    resolve: {
      person: ['authService', function (authService) {
        return authService.me();
      }],
      contracts: ['$stateParams', 'person', 'contractService', function ($stateParams, person, contractService) {
        return contractService.forContractor({
          person: person.id
        });
      }]
    }
  });
})

.controller('ContractChoiceController', function ($scope, $state, alertService, depositService, person, contracts, $log) {
  
  $scope.hasMember = contracts.some(function (c) { return c.type ===  62; });
  $scope.hasGo     = contracts.some(function (c) { return c.type ===  60; });
  $log.debug($scope.hasMember, $scope.hasGo);
  if(!$scope.hasMember || !$scope.hasGo) {
    $state.go('owm.finance.deposit');
  }
  
  $scope.createMember = function () {
    alertService.load();

    $log.log('requesting 62 contract');

    depositService.requestContractAndPay({
        person: person.id,
        contractType: 62,
        contract: contracts[0].id
      });
  };
  
  $scope.createGo = function () {
    alertService.load();

    $log.log('requesting 60 contract');

    depositService.requestContractAndPay({
        person: person.id,
        contractType: 60,
        contract: contracts[0].id
      });
  };
});
