'use strict';

angular.module('owm.finance.invoiceGroups', [])

.controller('FinanceInvoiceGroupsController', function ($scope, alertService, paymentService) {

  var me = $scope.$parent.me;

  $scope.invoiceGroups = [];
  $scope.isLoading     = false;

  loadInvoiceGroups();

  function loadInvoiceGroups () {
    $scope.isLoading = true;
    paymentService.getInvoiceGroups({
      person: me.id,
      includePaid: true
    }).then(function (invoiceGroupLinks) {
      var arr = [];
      angular.forEach(invoiceGroupLinks, function (link) {
        arr.push(link.invoiceGroup);
      });
      $scope.invoiceGroups = arr;
    })
    .catch(function (err) {
      alertService.show(err.level, err.message, 500);
    })
    .finally(function () {
      $scope.isLoading = false;
    });
  }

});
