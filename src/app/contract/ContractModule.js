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

  $scope.hasMember = contracts.some(function (c) { return c.type.id ===  62; });
  $scope.hasGo     = contracts.some(function (c) { return c.type.id ===  60; });
  $scope.hasPremium  = contracts.some(function (c) { return c.type.id ===  66; });
  console.log($scope.hasMember);
  console.log($scope.hasGo);
  console.log($scope.hasPremium);

  if(!$scope.hasMember && !$scope.hasGo) {
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
    }).then(function (contractRequest) {
      $state.go('owm.finance.deposit');
    });
  };
})
.directive('sameHeight', function ($window, $timeout) {
  var sameHeight = {
    restrict: 'A',
    groups: {},
    link: function (scope, element, attrs) {
      if(!scope.sameHeight) {
        scope.sameHeight = {
          groups: {}
        };
      }
      $timeout(getHighest); // make sure angular has proceeded the binding
      angular.element($window).bind('resize', getHighest);

      function getHighest() {
        if (!scope.sameHeight.groups[attrs.sameHeight]) { // if not exists then create the group
          scope.sameHeight.groups[attrs.sameHeight] = {
            height: 0,
            elems:[]
          };
        }
        scope.sameHeight.groups[attrs.sameHeight].elems.push(element);
        element.css('height', ''); // make sure we capture the origin height
        console.log(attrs.sameHeight + ' was:', scope.sameHeight.groups[attrs.sameHeight].height);
        if (scope.sameHeight.groups[attrs.sameHeight].height < element.outerHeight()) {
          scope.sameHeight.groups[attrs.sameHeight].height = element.outerHeight();
        }
        console.log(attrs.sameHeight + ' wordt:', scope.sameHeight.groups[attrs.sameHeight].height);

        angular.forEach(scope.sameHeight.groups[attrs.sameHeight].elems, function(elem){
          elem.css('height', scope.sameHeight.groups[attrs.sameHeight].height);

        });
      }
    }
  };
  return sameHeight;
})
;
