'use strict';

angular.module('owm.finance.invoiceGroupsV1', [])

.controller('FinanceInvoiceGroupsV1Controller', function ($scope, linksService, invoiceService, alertService, me) {

  $scope.invoiceGroups = null;

  loadInvoiceGroups();

  function loadInvoiceGroups () {
    alertService.load();
    invoiceService.allGroups({
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
      alertService.loaded();
    });
  }

  $scope.createInvoiceGroupPdfLink = function (invoiceGroup) {
    return linksService.invoiceGroupPdf_v1(invoiceGroup.id);
  };

});
