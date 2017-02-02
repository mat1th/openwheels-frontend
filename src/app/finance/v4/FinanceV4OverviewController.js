'use strict';

angular.module('owm.finance.v4', [])

.controller('FinanceV4OverviewController', function ($scope, me, $stateParams, invoice2Service, paymentService, voucherService, linksService, invoiceService, alertService, $state, $mdDialog, $q, appConfig, $window) {
  $scope.config = appConfig;
  $scope.me = me;
  $scope.provider = me.provider.id;

  $scope.loaded = {ungrouped: false, grouped: false};
  $scope.view = me.preference || 'both';

  $scope.activeTab = {active: 0};
  $scope.vouchersPerPage = 15;
  $scope.groupedInvoicesPerPage = 15;

  // get ungrouped invoices
  invoice2Service.getUngroupedForPerson({person: me.id})
  .then(addExtraInvoiceInformation)
  .then(addGrantTotal)
  .then(groupInvoicesByBookingRelation)
  .then(function(results) { $scope.openInvoices = results; })
  .finally(function() { $scope.loaded.ungrouped = true; })
  ;

  // get grouped invoices (invoice2Module)
  var newInvoices = paymentService.getInvoiceGroups({person: me.id, max: 100})
  .then(addExtraInvoiceGroupInformation)
  .then(function(results) { $scope.groupedInvoices = results; return results;})
  ;

  // get grouped invoices (old invoiceModule)
  var oldInvoices = invoiceService.allGroups({filter: {person: me.id}, limit: 100})
  .then(function (paged){ return paged.result; })
  .then(addExtraInformationOldInvoices)
  .then(function(results) { $scope.groupedInvoicesOld = results; return results;})
  ;
  

  // get credit
  var requiredCredit = voucherService.calculateRequiredCredit({person: me.id})
  .then(function(results) { $scope.requiredCredit = results; return results;})
  ;

  // get vouchers
  var vouchers = voucherService.search({person: me.id, minValue: 0.0})
  .then(function(vouchers) { $scope.vouchers = vouchers; return vouchers;})
  ;


  $q.all({newInvoices: newInvoices, oldInvoices: oldInvoices, requiredCredit: requiredCredit, vouchers: vouchers})
  .then(function(results) {
    var allInvoices = [];

    _.forEach(results.newInvoices, function(newInvoice) {
      allInvoices.push({type: 'new', invoice: newInvoice});
    });
    _.forEach(results.oldInvoices, function(oldInvoice) {
      allInvoices.push({type: 'old', invoice: oldInvoice});
    });
    $scope.allGroupedInvoices = _.sortBy(allInvoices, function(invoice) {
      var a;
      if(invoice.type === 'old') {
        if(!invoice.invoice.due) {
          return -Infinity;
        }
        a = moment(invoice.invoice.due);
      } else {
        a = moment(invoice.invoice.date);
      }
      return a.format('X') * -1;
    });
    return $scope.allGroupedInvoices;
  })
  .finally(function() { $scope.loaded.grouped = true; })
  ;

  // util function
  function log(a) {
    console.log(a);
    return a;
  }
  function loglabel(label) {
    return function(toLog) {
      console.log(label, toLog);
      return toLog;
    };
  }

  function addExtraInformationOldInvoices(invoices) {
    invoices = _.map(invoices, function(invoice) {
      invoice.pdflink = linksService.invoiceGroupPdf_v1(invoice.id);
      return invoice;
    });
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
    if(status === 'USER_PAY') {
      return 'Nog te betalen';
    }
    if(status === 'USER_PAID') {
      return 'Betaald';
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
      return 'Deze factuur is nog niet betaald. Verhoog je rijtegoed om de factuur te voldoen of klik op betalen.';
    }
    if(status === 'PROVIDER_PAY') {
      return 'Deze factuur wordt binnenkort aan je uitbetaald.';
    }
  };

  $scope.statusTooltipEnable = function(status) {
    if(status === 'USER_PAY' || status === 'PROVIDER_PAY') {
      return true;
    }
    return false;
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

      bookingInvoice.invoices = _.map(bookingInvoice.invoices, function(invoice) {
        var type;
        if(invoice.recipient.id === me.id) {
          type = 'received';
        } else {
          type = 'sent';
        }
        invoice.type = type;
        return invoice;
      });

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
      if(bookingInvoice.booking) {
        bookingInvoice.pdf = linksService.tripDetailsPdf(bookingInvoice.booking.id);
      }

      if(bookingInvoice.totalToPay > bookingInvoice.totalToReceive) {
        bookingInvoice.totalToPay -= bookingInvoice.totalToReceive;
        bookingInvoice.totalToReceive -= bookingInvoice.totalToReceive;
      } else {
        bookingInvoice.totalToReceive -= bookingInvoice.totalToPay;
        bookingInvoice.totalToPay -= bookingInvoice.totalToPay;
      }

      bookingInvoice.hasToPay = bookingInvoice.totalToPay > bookingInvoice.totalToReceive;
      bookingInvoice.hasToReceive = bookingInvoice.totalToReceive > bookingInvoice.totalToPay;

      var res = _.groupBy(bookingInvoice.invoices, 'type');
      var invoiceLinesSent, invoiceLinesReceived = [];
      if(res.sent) {
        invoiceLinesSent = _.map(_.flatten(_.pluck(res.sent, 'invoiceLines')), function(i) {i.type='sent'; return i; });
      }
      if(res.received) {
        invoiceLinesReceived = _.map(_.flatten(_.pluck(res.received, 'invoiceLines')), function(i) {i.type='received'; return i; });
      }
      var invoiceLines = _.sortBy(_.union(invoiceLinesSent, invoiceLinesReceived), 'position');
      bookingInvoice.invoiceLines = invoiceLines;

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
    $state.go('owm.finance.vouchers');
  };

  $scope.payoutDialog = function() {
    var dialog = {
      templateUrl: 'finance/v4/payoutDialog.tpl.html',
      controller: ['$scope', '$mdDialog', 'vouchers', function($scope, $mdDialog, vouchers) {
        $scope.vouchers = vouchers;
        $scope.selectedVouchers = [];

        $scope.cancel = function() {
          $mdDialog.hide(false);
        };
        $scope.close = function(x) {
          if($scope.selectedVouchers.length) {
            $mdDialog.hide($scope.selectedVouchers);
          } else {
            $scope.cancel();
          }
        };

        $scope.toggle = function (item, list) {
          var idx = list.indexOf(item);
          if (idx > -1) {
            list.splice(idx, 1);
          }
          else {
            list.push(item);
          }
        };
        $scope.exists = function (item, list) {
          return list.indexOf(item) > -1;
        };
      }],
      locals: {
        vouchers: $scope.vouchers,
      },
    };

    $mdDialog.show(dialog)
    .then(function(vouchers) {
      if(!vouchers) {
        return;
      }
      var promises = [];
      _.forEach(vouchers, function(voucher) {
        promises.push(paymentService.payoutVoucher({voucher: voucher}));
      });

      return $q.all(promises)
      .then(function(results) {
        alertService.add('success', 'De aangevraagde uitbetalingen staan ingepland', 9000);
        $state.reload();
      });
    })
    .catch(function(err){
      alertService.add('danger', err, 9000);
    })
    ;
  };

  $scope.payInvoiceGroup = function(id) {
    alertService.load();

    paymentService.payInvoiceGroup({invoiceGroup: id})
    .then(function(result) {
      $window.location.href = result.url;
    })
    .catch(function(err) {
      alertService.add('danger', err, 3000);
    })
    .finally(function() {
      alertService.loaded();
    })
    ;
  };

});
