'use strict';

angular.module('owm.trips.index', [])

.controller('TripsIndexController', function ($log, $timeout, $q, API_DATE_FORMAT, alertService, bookingService, me, $scope, linksService) {

  // keys
  var FOR_OWNER = 'forOwner';
  var FOR_RENTER = 'forRenter';

  // map bookingService methods
  var methods = {};
  methods[FOR_RENTER] = 'getBookingList';
  methods[FOR_OWNER] = 'forOwner';

  var isFirstLoad = true;

  // scope
  $scope.me = me;
  $scope.provider = me.provider.id;
  $scope.years = (function () {
    var y = moment().year();
    return [y-2, y-1, y, y+1];
  }());
  var bookings = $scope.bookings = {};
  bookings[FOR_RENTER] = {
    data: [],
    isLoading: false,
    isCollapsed: true
  };
  bookings[FOR_OWNER] = {
    data: [],
    isLoading: false,
    isCollapsed: true
  };

  $scope.selectedYear  = moment().year();
  $scope.$watch('selectedYear', function (year) {
    loadYear(year);
  });

  function loadYear (year) {
    var range = {
      startDate: moment([year    , 0, 1]),
      endDate  : moment([year + 1, 0, 1])
    };
    $log.debug('Load year: ', toLog(range));

    bookings[FOR_RENTER].data = [];
    bookings[FOR_OWNER].data = [];

    // alertService.closeAll();
    // alertService.load();

    $q.all([loadBookings(FOR_OWNER, range), loadBookings(FOR_RENTER, range)]).finally(function () {
      if (isFirstLoad) {
        isFirstLoad = false;
        bookings[FOR_RENTER].isCollapsed = bookings[FOR_RENTER].data.length <= 0;
        bookings[FOR_OWNER].isCollapsed = bookings[FOR_OWNER].data.length <= 0;
      }
      // alertService.loaded();
    });
  }

  function loadBookings (key, range) {
    bookings[key].isLoading = true;
    return bookingService[methods[key]]({
      person: me.id,
      timeFrame: {
        startDate: range.startDate.format(API_DATE_FORMAT),
        endDate  : range.endDate.format(API_DATE_FORMAT)
      }
    }).then(function (data) {
      $log.debug('GOT ' + data.length + ' BOOKINGS ' + key);
      bookings[key].data = data;
      return data;
    }).finally(function () {
      bookings[key].isLoading = false;
    });
  }

  function toLog (range) {
    return range.startDate.format('DD-MM-YY HH:MM') + ' t/m ' + range.endDate.format('DD-MM-YY HH:MM');
  }

  $scope.createTripDetailsLink = function (booking) {
    return linksService.tripDetailsPdf(booking.id);
  };

})
;
