'use strict';

angular.module('owm.finance.v2', [])

.controller('FinanceV2Controller', function ($window, $q, $state, $location, $scope, $uibModal, appConfig, alertService,
  invoice2Service, paymentService, linksService, API_DATE_FORMAT) {

  /* require parent scope */
  var me = $scope.me;

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
  alertService.load($scope);
  $q.all([loadUnpaidInvoices(), loadInvoiceGroups(), loadSentInvoices() ])
  .catch(function (err) {
    alertService.addError(err);
  })
  .finally(function () {
    alertService.loaded($scope);
    $scope.isLoading = false;

    var hasData = false;
    hasData = hasData || !!($scope.unpaidInvoices && $scope.unpaidInvoices.length);
    hasData = hasData || !!($scope.invoiceGroups && $scope.invoiceGroups.length);
    hasData = hasData || !!($scope.sentInvoices && $scope.sentInvoices.length);
    $scope.$emit('v2LoadComplete', hasData);
  });

  $scope.createInvoiceGroupPdfLink = function (invoiceGroup) {
    return linksService.invoiceGroupPdf(invoiceGroup.id);
  };

  // verzamel en betaal openstaande facturen
  $scope.payInvoices = function () {
    alertService.load($scope);
    paymentService.pay({ person: me.id }).then(function (result) {
      redirectToPaymentUrl(result.url);
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded($scope);
    });
  };

  // betaal openstaande verzamelfactuur
  $scope.payInvoiceGroup = function (invoiceGroup) {
    alertService.load($scope);
    paymentService.payInvoiceGroup({
      invoiceGroup: invoiceGroup.id
    }).then(function (result) {
      redirectToPaymentUrl(result.url);
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded($scope);
    });
  };

  // 1) verzamel invoices
  // 2) verzoek om uitbetaling verzamelfactuur
  $scope.payoutInvoices = function () {
    alertService.load($scope);
    invoice2Service.createSenderInvoiceGroup({ person: me.id }).then(function (invoiceGroup) {
      $scope.sentInvoices = [];
      $scope.invoiceGroups = $scope.invoiceGroups || [];
      $scope.invoiceGroups.push(invoiceGroup);
      return $scope.payoutInvoiceGroup(invoiceGroup);
    })
    .then(loadUnpaidInvoices)
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded($scope);
    });
  };

  // verzoek om uitbetaling verzamelfactuur
  $scope.payoutInvoiceGroup = function (invoiceGroup) {
    alertService.load($scope);
    return paymentService.payoutInvoiceGroup({ invoiceGroup: invoiceGroup.id }).then(function (result) {
      // add fake payout request
      invoiceGroup.payoutRequest = {
        created: moment().format(API_DATE_FORMAT)
      };
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded($scope);
    });
  };

  function redirectToPaymentUrl (paymentUrl) {
    var url = paymentUrl + '?redirectTo=' + encodeURIComponent(paymentResultUrl());
    $window.location.replace(url, '_top');
  }

  function paymentResultUrl () {
    return appConfig.appUrl + $state.href('owm.finance.payment-result');
  }

  function currentUrl () {
    return appConfig.appUrl + $location.path();
  }

  function loadUnpaidInvoices () {
    return invoice2Service.getReceived({
      person       : me.id,
      status       : 'unpaid',
      grouped      : 'ungrouped'
    })
    .then(function (invoices) {

      /* group invoices by trip */
      $scope.unpaidInvoicesByTrip = (function () {
        var grouped = {};
        angular.forEach(invoices, function (invoice) {
          var groupKey;

          if (invoice.booking) {
            groupKey = 'trip_' + invoice.booking.id;
          } else {
            groupKey = 'no_trip';
          }
          grouped[groupKey] = grouped[groupKey] || {
            tripId: null,
            tripDetailsLink: null,
            invoices: [],
            invoiceLines: [],
          };
          if (invoice.booking) {
            grouped[groupKey].tripId = invoice.booking.id;
            grouped[groupKey].tripDetailsLink = linksService.tripDetailsPdf(invoice.booking.id);
          }
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
      status: 'both',
      grouped: 'ungrouped'
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
