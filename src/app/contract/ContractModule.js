'use strict';
angular.module('owm.contract', [])
.config(function($stateProvider){
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
      }]
    }
  });
})
.controller('ContractChoiceController', function ($scope, depositService, person, contractService, $log) {
  $scope.createMember = function () {
    $log.log('requesting 62 contract');
    contractService.forContractor({
      person: person.id
    })
    .then(function (contracts){
      $log.log(contracts);
      if(contracts.length !== 1) {
        //@todo fix what if more than 1 contract
        throw 'can\'t handle contracts';
      }
      return contracts[0];
    })
    .then(function(contract) {
      return depositService.requestContractAndPay({
        person: person.id,
        contractType: 62,
        contract: contract.id
      });
    });
  };
});