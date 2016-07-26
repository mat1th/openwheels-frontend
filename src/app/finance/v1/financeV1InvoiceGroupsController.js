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
      var mockData = [
        {id: 1, total: 122, paid: 122, due: new Date()},
        {id: 2, total: 22.82, paid: 22.82, due: new Date()},
        {id: 3, total: 114.15, paid: 114.15, due: new Date()},
        {id: 4, total: 42.19, paid: 42.19, due: new Date()},
      ];
      $scope.invoiceGroups = mockData;
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
