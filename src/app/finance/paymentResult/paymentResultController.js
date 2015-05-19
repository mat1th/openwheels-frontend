'use strict';
angular.module('owm.finance.paymentResult', [])

.controller('PaymentResultController', function ($scope, orderStatusId) {
  $scope.orderStatusId = orderStatusId;
})
;
