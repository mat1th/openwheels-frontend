'use strict';

angular.module('owm.finance.v4', [])

.controller('FinanceV4OverviewController', function ($scope, me, $stateParams, invoice2Service, paymentService) {
  $scope.me = me;
  $scope.loaded = false;
  $scope.view = me.preference || 'both';

  invoice2Service.getUngroupedForPerson({person: me.id})
//.then(log)
  .then(addExtraInvoiceInformation)
  .then(addGrantTotal)
  .then(groupInvoicesByBookingRelation)
//.then(log)
  .then(function(results) { $scope.openInvoices = results; })
  .finally(function() { $scope.loaded = true; })
  ;

  paymentService.getInvoiceGroups({person: me.id, max: 100})
  .then(addExtraInvoiceGroupInformation)
  .then(log)
  .then(function(results) { $scope.groupedInvoices = results; })
  ;

  function log(invoices) {
    console.log(invoices);
    return invoices;
  }

  function status(invoice) {
    if(invoice.userHasToPay) {
      if(invoice.paid === null) {
        return 'USER_PAY';
      }
      return 'USER_PAID';
    }
    if(invoice.paid === null) {
      return 'PROVIDER_PAY';
    }
    return 'PROVIDER_PAID';
  }

  $scope.statusText = function(status) {
    var text;
    switch(status) {
      case 'USER_PAY':
        text = 'Nog te betalen';
        break;
      case 'USER_PAID':
        text = 'Betaling voldaan';
        break;
      case 'PROVIDER_PAID':
        text = 'Uitbetaald';
        break;
      case 'PROVIDER_PAY':
        text = 'In behandeling';
        break;
    }
    return text;
  };

  $scope.statusTooltipText = function(status) {

  };

  $scope.statusTooltipEnable = function(status) {

  };

  function addExtraInvoiceGroupInformation(invoices) {
    return _.map(invoices, function(invoice) {
      invoice.userHasToPay = invoice.total > 0;
      invoice.userHasToReceive = invoice.total < 0;
      invoice.status = status(invoice);
      return invoice;
    });
  }

  function addGrantTotal(invoices) {
    invoices._totals = {};
    invoices._totals.grandTotalToPay = _.reduce(invoices, function(memo, bookingInvoice) {
      return memo + bookingInvoice.totalToPay;
    }, 0.0);
    invoices._totals.grandTotalToReceive = _.reduce(invoices, function(memo, bookingInvoice) {
      return memo + bookingInvoice.totalToReceive;
    }, 0.0);

    if(invoices._totals.grandTotalToPay > invoices._totals.grandTotalToReceive) {
      invoices._totals.grandTotalToPay -= invoices._totals.grandTotalToReceive;
      invoices._totals.grandTotalToReceive -= invoices._totals.grandTotalToReceive;
    } else {
      invoices._totals.grandTotalToReceive -= invoices._totals.grandTotalToPay;
      invoices._totals.grandTotalToPay -= invoices._totals.grandTotalToPay;
    }

    invoices._totals.hasToPay = invoices._totals.grandTotalToPay > 0;
    invoices._totals.hasToReceive = invoices._totals.grandTotalToReceive > 0;

    return invoices;
  }

  function addExtraInvoiceInformation(invoices) {
    invoices = _.map(invoices, function(bookingInvoice) {
      bookingInvoice.total = _.reduce(bookingInvoice.invoices, function(memo, invoice) {
        return memo + invoice.total;
      }, 0.0);
      if(bookingInvoice.invoices[0].recipient.id === me.id) {
        bookingInvoice.totalToPay = (bookingInvoice.total > 0 ? bookingInvoice.total * 1 : 0);
        bookingInvoice.totalToReceive = (bookingInvoice.total < 0 ? bookingInvoice.total * -1 : 0);
      } else {
        bookingInvoice.totalToPay = (bookingInvoice.total < 0 ? bookingInvoice.total * -1 : 0);
        bookingInvoice.totalToReceive = (bookingInvoice.total > 0 ? bookingInvoice.total * 1 : 0);
      }
      bookingInvoice.hasToPay = bookingInvoice.totalToPay > 0;
      bookingInvoice.hasToReceive = bookingInvoice.totalToReceive > 0;
      return bookingInvoice;
    });
    return invoices;
  }

  function groupInvoicesByBookingRelation(invoices) {
    var totals = invoices._totals;
    delete invoices._totals;
    invoices = _.groupBy(invoices, function(bookingInvoice) {
      if(bookingInvoice.booking) {
        if(bookingInvoice.booking.person.id === me.id) {
          return 'renter';
        }
        return 'owner';
      }
      return 'null';
    });
    invoices.totals = totals;
    return invoices;
  }
  
  var vouchers = [
    {id: 1, total: 100, unused: 20.20, bought: new Date()},
    {id: 2, total: 200, unused: 100, bought: new Date()},
    {id: 3, total: 200, unused: 0, bought: new Date()},
    {id: 4, total: 100, unused: 0, bought: new Date()},
    {id: 5, total: 75, unused: 0, bought: new Date()},
    {id: 6, total: 75, unused: 0, bought: new Date()},
  ];
  $scope.vouchers = vouchers;

});
