'use strict';

angular.module('owm.person.action.payinvoicegroup', [])

.controller('PersonActionPayInvoiceGroupController', function ($scope, paymentData) {
  $scope.paymentData = paymentData;
})
;
