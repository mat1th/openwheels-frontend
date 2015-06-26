'use strict';

angular.module('owm.payment', []).config(function ($stateProvider) {

  $stateProvider.state('owm.payment', {
    abstract: true
  });

  $stateProvider.state('owm.payment.invoiceGroup', {
    url: '/payment/:invoiceGroupId',
    resolve: {
      redirectToPaymentUrl: ['$window', '$state', '$stateParams', 'paymentService', 'alertService', 'appConfig',
                    function ($window,   $state,   $stateParams,   paymentService,   alertService,   appConfig) {
        var invoiceGroupId = $stateParams.invoiceGroupId;
        alertService.load();
        paymentService.payInvoiceGroup({
          invoiceGroup: invoiceGroupId
        })
        .then(function (invoiceGroup) {
          var redirectTo = appConfig.appUrl + $state.href('owm.finance.payment-result');
          var url = invoiceGroup.url + '?redirectTo=' + encodeURIComponent(redirectTo);
          $window.location.replace(url, '_top');
        })
        .catch(function (err) {
          $state.go('owm.person.dashboard');
        })
        .finally(function () {
          alertService.loaded();
        });
      }]
    }
  });

});
