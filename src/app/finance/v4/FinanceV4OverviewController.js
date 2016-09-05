'use strict';

angular.module('owm.finance.v4', [])

.controller('FinanceV4OverviewController', function ($scope, me, $stateParams, invoice2Service, paymentService, voucherService, linksService, invoiceService, alertService, $state, $mdDialog) {
  $scope.me = me;
  $scope.loaded = false;
  $scope.view = me.preference || 'both';
  $scope.activeTab = {active: 0};
  $scope.perPage = 15;

  invoice2Service.getUngroupedForPerson({person: me.id})
  .then(addExtraInvoiceInformation)
  .then(addGrantTotal)
  .then(groupInvoicesByBookingRelation)
  .then(function(results) { $scope.openInvoices = results; })
  .finally(function() { $scope.loaded = true; })
  ;

  paymentService.getInvoiceGroups({person: me.id, max: 100})
  .then(addExtraInvoiceGroupInformation)
  .then(function(results) { $scope.groupedInvoices = results; })
  ;

  voucherService.calculateRequiredCredit({person: me.id})
  .then(log)
  .then(function(results) {
    $scope.requiredCredit = results;
  })
  ;

  voucherService.search({person: me.id, minValue: 0.0})
  .then(function(vouchers) { $scope.vouchers = vouchers; })
  ;

  invoiceService.paymentsForPerson({person: me.id})
  .then(addExtraInformationOldInvoices)
  ;

  function log(invoices) {
    console.log(invoices);
    return invoices;
  }

  $scope.newPage = function(a) {
  };

  function addExtraInformationOldInvoices(invoices) {

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
    if(status === 'USER_PAY') {
      return 'Nog te betalen';
    }
    if(status === 'USER_PAID') {
      return 'Betaling voldaan';
    }
    if(status === 'PROVIDER_PAY') {
      return 'In behandeling';
    }
    if(status === 'PROVIDER_PAID') {
      return 'Uitbetaald';
    }
  };

  $scope.statusTooltipText = function(status) {
    if(status === 'USER_PAY') {
      return 'Deze factuur is nog niet betaald. Verhoog je rijtegoed om de factuur te voldoen.';
    }
    if(status === 'PROVIDER_PAY') {
      return 'Deze factuur wordt binnenkort aan je uitbetaald.';
    }
  };

  $scope.statusTooltipEnable = function(status) {
    if(status === 'USER_PAY') {
      return true;
    }
    if(status === 'USER_PAID') {
      return false;
    }
    if(status === 'PROVIDER_PAY') {
      return true;
    }
    if(status === 'PROVIDER_PAID') {
      return false;
    }
  };

  function addExtraInvoiceGroupInformation(invoices) {
    return _.map(invoices, function(invoice) {
      invoice.userHasToPay = invoice.total > 0;
      invoice.userHasToReceive = invoice.total < 0;
      invoice.status = status(invoice);
      invoice.pdflink = linksService.invoiceGroupPdf(invoice.id);
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
      var totals = _.reduce(bookingInvoice.invoices, function(memo, invoice) {
        if(invoice.recipient.id === me.id) {
          memo.totalToPay += invoice.total;
        } else {
          memo.totalToReceive += invoice.total;
        }
        return memo;
      }, {totalToPay: 0.0, totalToReceive: 0.0});

      bookingInvoice.totalToPay = totals.totalToPay;
      bookingInvoice.totalToReceive = totals.totalToReceive;

      if(bookingInvoice.totalToPay > bookingInvoice.totalToReceive) {
        bookingInvoice.totalToPay -= bookingInvoice.totalToReceive;
        bookingInvoice.totalToReceive -= bookingInvoice.totalToReceive;
      } else {
        bookingInvoice.totalToReceive -= bookingInvoice.totalToPay;
        bookingInvoice.totalToPay -= bookingInvoice.totalToPay;
      }

      bookingInvoice.hasToPay = bookingInvoice.totalToPay > bookingInvoice.totalToReceive;
      bookingInvoice.hasToReceive = bookingInvoice.totalToReceive > bookingInvoice.totalToPay;

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

  $scope.renterPay = function() {
    alertService.load();
    invoice2Service.createRecipientInvoiceGroup({person: me.id, positiveOnly: false})
    .then(function(invoiceGroup) {
      if(invoiceGroup === null) {
        throw new Error('Deze factuur kan niet worden gesloten. Deze factuur wordt met volgende facturen verrekend.');
      }
      alertService.add('success', 'Facturen succesvol gesloten', 3000);
      $scope.activeTab.active = 1;
      return invoiceGroup;
    })
    .catch(function(err) {
      alertService.add('danger', err, 3000);
    })
    .finally(function() {
      alertService.loaded();
    })
    ;
  };
  
  $scope.ownerPayout = function() {
    alertService.load();
    invoice2Service.createSenderInvoiceGroup({person: me.id, closeReceived: true})
    .then(function(invoiceGroup) {
      if(invoiceGroup === null) {
        throw new Error('Deze factuur kan niet worden gesloten. Deze factuur wordt met volgende facturen verrekend.');
      }
      return paymentService.payoutInvoiceGroup({invoiceGroup: invoiceGroup.id});
    })
    .then(function(payment) {
      alertService.add('success', 'Facturen succesvol gesloten', 3000);
      $state.reload();
      return payment;
    })
    .catch(function(err) {
      alertService.add('danger', err, 3000);
    })
    .finally(function() {
      alertService.loaded();
    })
    ;
  };

  $scope.bothPay = function() {
    $scope.renterPay();
  };

  $scope.bothPayout = function() {
    $scope.ownerPayout();
  };

  $scope.buyVoucher = function() {
//    $mdDialog.show({
//      templateUrl: 'finance/v4/buyVoucherDialog.tpl.html',
//      controller: function($mdDialog, $scope, requiredCredit) {
//        $scope.requiredCredit = requiredCredit;
//        $scope.cancel = function() {
//          $mdDialog.hide();
//        };
//      },
//      locals: {requiredCredit: $scope.requiredCredit},
//    });
    $state.go('owm.finance.vouchers');
  };

});
