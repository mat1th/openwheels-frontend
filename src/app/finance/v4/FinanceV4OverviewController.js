'use strict';

angular.module('owm.finance.v4', [])

.controller('FinanceV4OverviewController', function ($scope, me, $stateParams, invoice2Service) {
  $scope.showVouchers = true;
  $scope.showInvoices = true;
  $scope.view = $stateParams.view || 'both';

  var sent, received;
  invoice2Service.getSent({person: me.id, grouped: 'ungrouped', max: 200})
  .then(function(res) {
    sent = res;
    return invoice2Service.getReceived({person: me.id, grouped: 'grouped', max: 200});
  })
  .then(function(res) {
    received = res;
    return true;
  })
  .then(function(res) {
    return true;
  })
  ;

  dummyData();
  function sortArray(arrayOfSubinvoices) {
    var orderRenter = {
      'Huur auto': 100,
      'Kilometers': 90,
      'Brandstof': 80,
      '*pos*': 70,
      'Ritverzekering': 30,
      'MyWheels Fee': 20,
      '*neg*': 10,
      '_': 0,
    };

    function getKey(c) {
      if(orderRenter[c.type] === undefined) {
        return (c.amount >= 0 ? '*pos*' : '*neg*');
      }
      return c.type;
    }

    return arrayOfSubinvoices.sort(function(a, b) {
      return orderRenter[getKey(a)] < orderRenter[getKey(b)];
    });
  }

  function calcTotal(arrayOfSubinvoices) {
    var total = 0;

    arrayOfSubinvoices.forEach(function(invoice) {
      total += invoice.amount;
    });
    return total;
  }

  function dummyData () {
    var orderBookings = function(booking) {
      booking.invoices.push({amount: 0, type: '_'});
      booking.invoices = sortArray(booking.invoices);
      booking.total = calcTotal(booking.invoices);
      return booking;
    };
    var openBookingInvoicesRenter = [
      {booking: {date: new Date(), name: 'Hans Bullewijk', booking_id: 100,}, invoices: [{amount: 50, type: 'Kilometers'}, {amount: 60.12, type: 'Huur auto'}, {amount: 25, type: 'Schoonmaakkosten'}, {amount: -2.5, type: 'MyWheels Fee'}, {amount: -42.32, type: 'Brandstof getankt door huurder'}, {amount: -1.26, type: 'Ritverzekering'}]},
      {booking: {date: new Date(), name: 'Anne ter Zal', booking_id: 100,}, invoices: [{amount: 50, type: 'Kilometers'}, {amount: 50, type: 'Huur auto'}, {amount: -2.5, type: 'MyWheels Fee'}, {amount: -0.89, type: 'Ritverzekering'}]},
      {booking: {date: new Date(), name: 'Erick Boogaard', booking_id: 100,}, invoices: [{amount: 50, type: 'Kilometers'}, {amount: 50, type: 'Huur auto'}, {amount: 22, type: 'Schoonmaakkosten'}, {amount: -2.5, type: 'MyWheels Fee'}]},
    ];
    var openBookingInvoicesOwner = [
      {booking: {date: new Date(), name: 'Freek Boutkan', booking_id: 100,}, invoices: [{amount: 40, type: 'Kilometers'}, {amount: 60.12, type: 'Huur auto'}, {amount: 25, type: 'Schoonmaakkosten'}, {amount: -2.5, type: 'MyWheels Fee'}, {amount: -42.32, type: 'Brandstof getankt door huurder'}, {amount: -1.26, type: 'Ritverzekering'}]},
      {booking: {date: new Date(), name: 'Tonny van het Reeve', booking_id: 100,}, invoices: [{amount: 33, type: 'Kilometers'}, {amount: 12, type: 'Huur auto'}, {amount: -2.5, type: 'MyWheels Fee'}, {amount: -0.89, type: 'Ritverzekering'}]},
      {booking: {date: new Date(), name: 'Marie Antoinette Eick', booking_id: 6,}, invoices: [{amount: 62, type: 'Kilometers'}, {amount: 23, type: 'Huur auto'}, {amount: 17, type: 'Schoonmaakkosten'}, {amount: -2.5, type: 'MyWheels Fee'}]},
    ];

    openBookingInvoicesRenter.map(orderBookings);
    openBookingInvoicesOwner.map(orderBookings);
    $scope.openBookingInvoicesRenter = openBookingInvoicesRenter;
    $scope.openBookingInvoicesOwner = openBookingInvoicesOwner;

    $scope.total = 123.45;

    $scope.openOtherInvoices = [
      {desc: 'Verkeersboete', amount: -20,},
      {desc: 'Rectificatie tankbon ', amount: 12,},
    ];

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
  }
});
