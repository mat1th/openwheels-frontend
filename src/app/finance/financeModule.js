'use strict';

angular.module('owm.finance', [
  'owm.finance.index',
  'owm.finance.invoiceGroups',
  'owm.finance.invoiceGroupsV1'
])

.config(function config($stateProvider) {

  $stateProvider

  /**
   * OLD VERSION
   * kept for compatibility
   */

  .state('owm.financeV1', {
    abstract: true
  })

  .state('owm.financeV1.index', {
    url: '/finance/v1',
    views: {
      'main@': {
        templateUrl: 'finance/invoiceGroupsV1/financeInvoiceGroupsV1.tpl.html',
        controller: 'FinanceInvoiceGroupsV1Controller'
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
   * LATEST VERSION
   */

  .state('owm.finance', {
    abstract: true
  })

  .state('owm.finance.index', {
    url: '/finance',
    views: {
      'main@': {
        templateUrl: 'finance/index/financeIndex.tpl.html',
        controller: 'FinanceIndexController'
      }
    },
    data: {
      access: { deny: { anonymous: true } }
    },
    resolve: {
      me: ['authService', function (authService) {
        return authService.me();
      }]
    }
  })

  .state('owm.finance.deposit', {
    onEnter: ['$window', 'linksService', function ($window, linksService) {
      $window.location.href = linksService.depositUrl();
    }]
  });

});


