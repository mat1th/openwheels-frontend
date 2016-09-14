'use strict';

angular.module('owm.finance', [
  'owm.finance.vouchers',
  'owm.finance.voucherList',
  'owm.finance.paymentResult',
  'owm.finance.deposit',
  'owm.finance.v4',
])
.config(function config($stateProvider) {

  $stateProvider
  .state('owm.finance', {
    abstract: true
  })


  /**
   * V4 (latest)
   */

  .state('owm.finance.v4', {
    url: '/finance',
    views: {
      'main@shell': {
        templateUrl: 'finance/v4/financeOverview.tpl.html',
        controller: 'FinanceV4OverviewController'
      }
    },
    data: {
      access: {
        deny: {
          anonymous: true
        },
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
      'main@shell': {
        templateUrl: 'finance/deposit/deposit.tpl.html',
        controller: 'DepositController'
      }
    },
    data: {
      access: {
        deny: {
          anonymous: true
        }
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
      'main@shell': {
        templateUrl: 'finance/paymentResult/paymentResult.tpl.html',
        controller: 'PaymentResultController'
      }
    },
    resolve: {
      orderStatusId: ['$stateParams', function ($stateParams) {
        return $stateParams.orderStatusId;
      }],
      me: ['authService', function (authService) {
        return authService.me();
      }]
    }
  })

  .state('owm.finance.vouchers', {
    url: '/vouchers',
    views: {
      'main@shell': {
        templateUrl: 'finance/vouchers/vouchers.tpl.html',
        controller: 'VouchersController'
      }
    },
    data: {
      access: {
        deny: {
          anonymous: true
        }
      }
    },
    resolve: {
      me: ['authService', function (authService) {
        return authService.me();
      }]
    }
  });

});
