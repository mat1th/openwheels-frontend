'use strict';

angular.module('owm.finance', [
  'owm.finance.index',
  'owm.finance.invoiceGroups',
  'owm.finance.invoiceGroupsV1'
])

.config(function config($stateProvider) {

  $stateProvider

  .state('owm.finance', {
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

  .state('owm.financeV1', {
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
  });

});


