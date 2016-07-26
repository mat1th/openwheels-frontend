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
  dummyData();

  function dummyData () {
    var openInvoicesRenter = [
      {booking: {date: new Date(), name: 'Hans Bullewijk'}, total: 135.12, invoices: [{amount: 50, type: 'Kilometers'}, {amount: 60.12, type: 'Huur auto'}, {amount: 25, type: 'Schoonmaak kosten'}, {amount: -2.5, type: 'MyWheels toeslag'}, {amount: -42.32, type: 'Tankbon'}, {amount: -1.26, type: 'Verzekering'}]},
      {booking: {date: new Date(), name: 'Anne ter Zal'}, total: 122, invoices: [{amount: 50, type: 'Kilometers'}, {amount: 50, type: 'Huur auto'}, {amount: -2.5, type: 'MyWheels toeslag'}, {amount: -0.89, type: 'Verzekering'}]},
      {booking: {date: new Date(), name: 'Erick Boogaard'}, total: 82.35, invoices: [{amount: 50, type: 'Kilometers'}, {amount: 50, type: 'Huur auto'}, {amount: 22, type: 'Schoonmaak kosten'}, {amount: -2.5, type: 'MyWheels toeslag'}]},
    ];
    $scope.openInvoicesRenter = openInvoicesRenter;

    var payedGroupedInvoices = [
      {id: 1, total: 122, paid: 122, status: 'Betaald', due: new Date()},
      {id: 2, total: 22.82, paid: 22.82, status: 'Betaald', due: new Date()},
      {id: 3, total: 114.15, paid: 114.15, status: 'Betaald', due: new Date()},
      {id: 4, total: 42.19, paid: 42.19, status: 'In behandeling', due: new Date()},
    ];
    $scope.payedGroupedInvoices = payedGroupedInvoices;
  }
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
      'main@shell': {
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
      'main@shell': {
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
      'main@shell': {
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
      'main@shell': {
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
      'main@shell': {
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
      'main@shell': {
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
