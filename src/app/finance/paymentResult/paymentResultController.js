'use strict';
angular.module('owm.finance.paymentResult', [])

.controller('PaymentResultController', function ($scope, $state, orderStatusId, Analytics) {

  var afterPayment;

  $scope.result = {
    success: (orderStatusId > 0)
  };

  init();

  $scope.goAfterPayment = function () {
    if (!afterPayment) {
      $state.go('home');
    }

    if ($scope.result.success) {
      $state.go(afterPayment.success.stateName, afterPayment.success.stateParams);
    } else {
      $state.go(afterPayment.error.stateName, afterPayment.error.stateParams);
    }
  };

  function init () {
    try {
      $scope.afterPayment = afterPayment = JSON.parse(sessionStorage.getItem('afterPayment'));
    } catch (e) {
      $scope.afterPayment = afterPayment = null;
    }
    sessionStorage.removeItem('afterPayment');

    if(afterPayment) {
      if(orderStatusId > 0) {
        Analytics.trackEvent('payment', 'success');
      } else {
        Analytics.trackEvent('payment', 'failed');
      }
    }
  }

});
