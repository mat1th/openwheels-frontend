'use strict';

angular.module('owm.finance')

.service('depositService', function ($window, $timeout, $log, $state, contractService, paymentService) {

  this.requestContractAndPay = function (params) {
    var personId = params.person;
    var nextUrl = $state.href('owm.finance.payment-result', {}, { absolute: true });

    return contractService.requestContract(params)
    .then(function (contractRequest) {
      // TODO(jdb): check contractRequest.status === 'new' before paying:
      return paymentService.pay({
        person: personId
      });
    })
    .then(function (paymentInfo) {
      redirect(appendedNextUrl(paymentInfo.url, nextUrl));

      // call back after a few seconds (will keep busy-spinners spinning while redirect is still in progress)
      return $timeout(angular.noop, 5000);
    });
  };

  function appendedNextUrl (url, nextUrl) {
    return url + '?redirectTo=' + encodeURIComponent(nextUrl);
  }

  function redirect (url) {
    $window.location.replace(url, '_top');
  }

});
