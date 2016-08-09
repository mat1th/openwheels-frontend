'use strict';

angular.module('vouchersDirective', [])

.directive('voucher', function () {
  return {
    restrict: 'E',
    scope: {
      data: '@'
    },
    replace: true,
    templateUrl: 'directives/vouchers/vouchers.tpl.html',
    controller: function ($window, $q, $state, $scope, appConfig, alertService, voucherService,
      paymentService, bookingService) {
      if ($scope.data !== undefined) {
        $scope.booking = JSON.parse($scope.data);
      }
    }
  };
});
