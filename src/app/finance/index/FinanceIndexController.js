'use strict';

angular.module('owm.finance.index', [])

.controller('FinanceIndexController', function ($window, $q, $location, $scope, $modal, appConfig, alertService, invoice2Service, paymentService, me, linksService) {
  $scope.me = me;

  // invoices
  $scope.unpaidInvoices = null;
  $scope.unpaidInvoicesTotalAmount = 0;
  $scope.unpaidInvoicesByTrip = {};

  // invoice groups
  $scope.invoiceGroups = null;
  $scope.invoiceGroupsUnpaid = null;
  $scope.sentInvoices = null;

  // load data
  $scope.isLoading = true;
  alertService.load();
  $q.all([loadUnpaidInvoices(), loadInvoiceGroups(), loadSentInvoices() ])
  .catch(function (err) {
    alertService.addError(err);
  })
  .finally(function () {
    alertService.loaded();
    $scope.isLoading = false;
  });

  $scope.createInvoiceGroupPdfLink = function (invoiceGroup) {
    return linksService.invoiceGroupPdf(invoiceGroup.id);
  };

  // verzamel en betaal openstaande facturen
  $scope.payInvoices = function () {
    alertService.load();
    paymentService.pay({ person: me.id }).then(function (result) {
      redirectToPaymentUrl(result.url);
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded();
    });
  };

  // betaal openstaande verzamelfactuur
  $scope.payInvoiceGroup = function (invoiceGroup) {
    alertService.load();
    paymentService.payInvoiceGroup({
      invoiceGroup: invoiceGroup.id
    }).then(function (result) {
      redirectToPaymentUrl(result.url);
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded();
    });
  };

  function redirectToPaymentUrl (paymentUrl) {
    var url = paymentUrl + '?redirectTo=' + encodeURIComponent(paymentResultUrl());
    $window.location.replace(url, '_top');
  }

  function paymentResultUrl () {
    return appConfig.appUrl + '/#/payment-result';
  }

  function currentUrl () {
    return appConfig.appUrl + '/#' + $location.path();
  }

  function loadUnpaidInvoices () {
    return invoice2Service.getReceived({
      person       : me.id,
      status       : 'unpaid',
      positivesOnly: true,
      grouped      : 'ungrouped'
    })
    .then(function (invoices) {

      /* group invoices by trip */
      $scope.unpaidInvoicesByTrip = (function () {
        var grouped = {};
        angular.forEach(invoices, function (invoice) {
          if (!invoice.booking) { return; }
          var groupKey = 'trip_' + invoice.booking.id;
          grouped[groupKey] = grouped[groupKey] || {
            invoices: [],
            invoiceLines: [],
            tripDetailsLink: linksService.tripDetailsPdf(invoice.booking.id)
          };
          grouped[groupKey].invoices.push(invoice);
          angular.forEach(invoice.invoiceLines, function (invoiceLine) {
            grouped[groupKey].invoiceLines.push(invoiceLine);
          });
        });
        return grouped;
      }());

      $scope.unpaidInvoices = invoices;

      // calculate total
      var sum = 0;
      var hasError = false;
      angular.forEach(invoices, function (invoice) {
        var invoiceTotal;
        try {
          invoiceTotal = parseFloat(invoice.total);
          sum += invoiceTotal;
        } catch (e) {
          hasError = true;
        }
      });
      $scope.unpaidInvoicesTotalAmount = hasError ? null : sum;
    });
  }

  function loadSentInvoices () {
    return invoice2Service.getSent({
      person: me.id,
      status: 'both'
    })
    .then(function (result) {
      $scope.sentInvoices = result;
    });
  }

  function loadInvoiceGroups () {
    return paymentService.getInvoiceGroups({
      person: me.id,
      status: 'both'
    })
    .then(function (result) {
      $scope.invoiceGroups = result;

      var unpaid = [];
      angular.forEach(result, function (invoiceGroup) {
        if (!invoiceGroup.paid) {
          unpaid.push(invoiceGroup);
        }
      });
      $scope.invoiceGroupsUnpaid = unpaid;
    });
  }

})
;
