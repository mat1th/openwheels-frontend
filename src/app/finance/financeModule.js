'use strict';

angular.module('owm.finance', [
  'owm.finance.v1InvoiceGroups',
  'owm.finance.v2',
  'owm.finance.vouchers',
  'owm.finance.voucherList',
  'owm.finance.paymentResult',
  'owm.finance.deposit'
])

.controller('FinanceVersionWrapperController', function ($scope, me) {
  $scope.me = me;

  $scope.v1NoData = false;
  $scope.v2NoData = false;

  $scope.$on('v1LoadComplete', function (evt, hasData) {
    $scope.v1NoData = !hasData;
  });

  $scope.$on('v2LoadComplete', function (evt, hasData) {
    $scope.v2NoData = !hasData;
  });
})

.config(function config($stateProvider) {

  $stateProvider

  .state('owm.finance', {
    abstract: true
  })

  /**
   * V1
   */

  .state('owm.finance.v1Index', {
    url: '/finance/v1',
    views: {
      'main@': {
        templateUrl: 'finance/v1/index.tpl.html',
        controller : 'FinanceVersionWrapperController'
      }
    },
    data: {
      access: {
        deny:    { anonymous: true },
        feature: 'invoiceModuleV1'
      }
    },
    resolve: {
      me: ['authService', function (authService) {
        return authService.me();
      }]
    }
  })

  /**
   * V2
   */

  .state('owm.finance.v2Index', {
    url: '/finance/v2',
    views: {
      'main@': {
        templateUrl: 'finance/v2/index.tpl.html',
        controller : 'FinanceVersionWrapperController'
      }
    },
    data: {
      access: {
        deny: { anonymous: true },
        feature: 'invoiceModuleV2'
      }
    },
    resolve: {
      me: ['authService', function (authService) {
        return authService.me();
      }]
    }
  })

  /**
   * V3 (latest)
   */

  .state('owm.finance.v3Index', {
    url: '/finance',
    views: {
      'main@': {
        templateUrl: 'finance/v3/index.tpl.html',
        controller : 'FinanceVersionWrapperController'
      }
    },
    data: {
      access: {
        deny: { anonymous: true },
        feature: 'invoiceModuleV3'
      }
    },
    resolve: {
      me: ['authService', function (authService) {
        return authService.me();
      }]
    }
  })

  /**
   * All versions
   */

  .state('owm.finance.deposit', {
    url: '/deposit',
    views: {
      'main@': {
        templateUrl: 'finance/deposit/deposit.tpl.html',
        controller: 'DepositController'
      }
    },
    data: {
      access: {
        deny: { anonymous: true }
      }
    },
    resolve: {
      me: ['authService', function (authService) {
        return authService.authenticatedUser();
      }]
    }
  })

  .state('owm.finance.payment-result', {
    url: '/payment-result?orderStatusId',
    views: {
      'main@': {
        templateUrl: 'finance/paymentResult/paymentResult.tpl.html',
        controller: 'PaymentResultController'
      }
    },
    resolve: {
      orderStatusId: ['$stateParams', function ($stateParams) {
        return $stateParams.orderStatusId;
      }]
    }
  })

  .state('owm.finance.vouchers', {
    url: '/vouchers',
    views: {
      'main@': {
        templateUrl: 'finance/vouchers/vouchers.tpl.html',
        controller : 'VouchersController'
      }
    },
    data: {
      access: {
        deny: { anonymous: true }
      }
    },
    resolve: {
      me: ['authService', function (authService) {
        return authService.me();
      }]
    }
  });


});
