'use strict';

angular.module('owm.finance.v1InvoiceGroups', [])

.controller('FinanceV1InvoiceGroupsController', function ($scope, linksService, invoiceService, alertService) {

  /* require parent scope */
  var me = $scope.me;

  $scope.invoiceGroups = null;

  loadInvoiceGroups().then(function () {
    var hasData = false;
    hasData = hasData || !!($scope.invoiceGroups && $scope.invoiceGroups.length);
    $scope.$emit('v1LoadComplete', hasData);
  });

  function loadInvoiceGroups () {
    alertService.load($scope);
    return invoiceService.allGroups({
      filter: {
        person: me.id
      }
    }).then(function (response) {
      $scope.invoiceGroups = response.result;
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded($scope);
    });
  }

  $scope.createInvoiceGroupPdfLink = function (invoiceGroup) {
    return linksService.invoiceGroupPdf_v1(invoiceGroup.id);
  };

});
