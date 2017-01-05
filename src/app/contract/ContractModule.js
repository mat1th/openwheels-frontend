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
    .then(goToNextPage)
    .catch(handleError)
    ;
  };

  function goToNextPage(res) {
    if(res === 'accept') {
      alertService.loaded();
      alertService.add('success', 'Contractwissel is geslaagd', 9000);
      $state.go('owm.person.dashboard');
    }
    else if(res === 'new') {
      $state.go('owm.finance.vouchers');
    }
    else {
      alertService.add('danger', 'Er is iets niet helemaal goed gegaan');
    }

  }

  function handleError(err) {
    alertService.loaded();
    alertService.add(err.level || 'danger', err.message);
  }

  $scope.createPremium = function () {
    alertService.load();

    $log.log('requesting 63 contract');

    depositService.requestContractAndPay({
      person: person.id,
      contractType: 63,
      contract: contracts[0].id
    })
    .then(goToNextPage)
    .catch(handleError)
    ;
  };

  $scope.createGo = function () {
    alertService.load();

    $log.log('requesting 60 contract');

    depositService.requestContractAndPay({
      person: person.id,
      contractType: 60,
      contract: contracts[0].id
    })
    .then(goToNextPage)
    .catch(handleError)
    ;
  };
})
;
