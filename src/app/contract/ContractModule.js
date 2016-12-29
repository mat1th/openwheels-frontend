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

.controller('ContractChoiceController', function ($scope, $state, alertService, depositService, person, contracts, $log, $mdMedia) {

  $scope.hasMember = contracts.some(function (c) { return c.type.id ===  62; });
  $scope.hasGo     = contracts.some(function (c) { return c.type.id ===  60; });
  $scope.hasPremium  = contracts.some(function (c) { return c.type.id ===  63; });

  $scope.$mdMedia = $mdMedia;

  if(contracts.length === 0) {
    depositService.requestContractAndPay({
        person: person.id,
        contractType: 60,
        contract: null
      })
      .then(function(res) {
        alertService.loaded();
        alertService.add('success', 'Je hebt nu een GO contract', 9000);
      });
  }

  $scope.createMember = function () {
    alertService.load();

    $log.log('requesting 62 contract');

    depositService.requestContractAndPay({
        person: person.id,
        contractType: 62,
        contract: contracts[0].id
      })
      .then(goToNextPage);
  };

  function goToNextPage(res) {
    if(res === 'accept') {
      alertService.loaded();
      alertService.add('success', 'Contractwissel is geslaagd', 9000);
      $state.go('owm.person.dashboard');
    }
  }

  $scope.createPremium = function () {
    alertService.load();

    $log.log('requesting 63 contract');

    depositService.requestContractAndPay({
        person: person.id,
        contractType: 63,
        contract: contracts[0].id
      })
      .then(goToNextPage);
  };

  $scope.createGo = function () {
    alertService.load();

    $log.log('requesting 60 contract');

    depositService.requestContractAndPay({
      person: person.id,
      contractType: 60,
      contract: contracts[0].id
    }).then(function (contractRequest) {
      $state.go('owm.finance.vouchers');
    });
  };
})
;
