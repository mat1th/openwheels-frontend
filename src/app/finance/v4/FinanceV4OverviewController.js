'use strict';

angular.module('owm.finance.v4', [])

.controller('FinanceV4OverviewController', function ($scope, me, $stateParams, invoice2Service) {
  $scope.showVouchers = true;
  $scope.showInvoices = true;
  $scope.me = me;
  $scope.loaded = false;
  $scope.view = me.preference || 'both';

  invoice2Service.getUngroupedForPerson({person: me.id})
  .then(addTotals)
  .then(groupInvoices)
  .then(function(results) {
    $scope.openInvoices = results;
  })
  .finally(function() {
    $scope.loaded = true;
  });

  function addTotals(invoices) {
    invoices = _.map(invoices, function(bookingInvoice) {
      bookingInvoice.total = _.reduce(bookingInvoice.invoices, function(memo, invoice) {
        return memo + invoice.total;
      }, 0.0);
      return bookingInvoice;
    });
    return invoices;
  }

  function groupInvoices(invoices) {
    invoices = _.groupBy(invoices, function(bookingInvoice) {
      if(bookingInvoice.booking) {
        if(bookingInvoice.booking.person.id === me.id) {
          return 'renter';
        }
        return 'owner';
      }
      return 'null';
    });
    return invoices;
  }

  var payedGroupedInvoices = [
    {id: 4, total: 122, paid: 122, status: 2, due: new Date()},
    {id: 3, total: 22.82, paid: 22.82, status: 1, due: new Date()},
    {id: 2, total: 114.15, paid: 114.15, status: 1, due: new Date()},
    {id: 1, total: 42.19, paid: 42.19, status: 1, due: new Date()},
  ];
  $scope.payedGroupedInvoices = payedGroupedInvoices;

  var vouchers = [
    {id: 1, total: 100, unused: 20.20, bought: new Date()},
    {id: 2, total: 200, unused: 100, bought: new Date()},
    {id: 3, total: 200, unused: 0, bought: new Date()},
    {id: 4, total: 100, unused: 0, bought: new Date()},
    {id: 5, total: 75, unused: 0, bought: new Date()},
    {id: 6, total: 75, unused: 0, bought: new Date()},
  ];
  $scope.vouchers = vouchers;

  $scope.statusToText = function(status) {
    if($scope.view === 'renter') {
      if(status === 1) {
        return 'Betaling ontvangen';
      }
      if(status === 2) {
        return 'In behandeling';
      }
    }
    if($scope.view === 'owner') {
      if(status === 1) {
        return 'Uitbetaald';
      }
      if(status === 2) {
        return 'In behandeling';
      }
    }
    if($scope.view === 'both') {
      if(status === 1) {
        return 'Verwerkt';
      }
      if(status === 2) {
        return 'In behandeling';
      }
    }

  };
});
