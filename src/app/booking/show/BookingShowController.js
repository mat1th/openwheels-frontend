'use strict';

angular.module('owm.booking.show', [])

.controller('BookingShowController', function (
  $q, $timeout, $log, $scope, $location, $filter, $translate, $state, appConfig, API_DATE_FORMAT,
  bookingService, resourceService, invoice2Service, alertService, dialogService,
  authService, boardcomputerService, chatPopupService, linksService,
  booking, me) {

  /**
   * HACK
   * see issue MW-1206 "booking.resource.price not implemented"
   */
  if (!booking.resource.price) {
    booking.resource.price = {};
    ['hourRate', 'dayRateTotal', 'fuelPerKilometer', 'kilometerRate', 'kmFree'].forEach(function (prop) {
      booking.resource.price[prop] = booking.resource[prop];
    });
  }

  $scope.bookingRequest = angular.copy(booking);
  $scope.bookingRequest.beginRequested = booking.beginRequested ? booking.beginRequested : booking.beginBooking;
  $scope.bookingRequest.endRequested= booking.endRequested ? booking.endRequested : booking.endBooking;

  $scope.booking = booking;
  $scope.resource = booking.resource;
  $scope.showBookingForm = false;
  $scope.showPricePerHour = false;
  $scope.userInput = {
    acceptRejectRemark: ''
  };

  $scope.userPerspective = (function () {
    if (booking.person.id === me.id) {
      return 'renter';
    } else {
      return 'owner';
    }
  }());

  initPermissions();

  if ($scope.allowOvereenkomst) {
    $scope.overeenkomstUrl = linksService.bookingAgreementPdf(booking.id);
  }

  function initPermissions () {
    var booking = $scope.booking;

    $scope.allowEdit   = false;
    $scope.allowCancel = false;
    $scope.allowStop   = false;
    $scope.allowAcceptReject  = false;
    $scope.allowBoardComputer = false;
    $scope.allowMap    = false;
    $scope.allowOvereenkomst = (booking.approved === null || booking.approved === 'OK') && booking.status === 'accepted';

    if ($scope.userPerspective === 'renter') {

      $scope.allowEdit = (function () {
        if (booking.endBooking) {
          return moment().isBefore(moment(booking.endBooking).add(1, 'hours')); // hooguit een uur geleden afgelopen
        }
        else if (booking.beginRequested) {
          return moment().isBefore(moment(booking.beginRequested)); // moet nog beginnen
        }
        return false;
      }());

      $scope.allowCancel = (function () {
        if (booking.beginBooking) {
          return moment().isBefore(moment(booking.beginBooking)); // moet nog beginnen
        }
        return true;
      }());

      $scope.allowBoardComputer = (function () {
        return (booking.status === 'accepted' &&
          booking.resource.locktypes.indexOf('smartphone') >= 0 &&
          booking.beginBooking && booking.endBooking &&
          moment().isAfter(moment(booking.beginBooking).add(-5, 'minutes')) && // hooguit 5 minuten geleden begonnen
          moment().isBefore(moment(booking.endBooking).add(1, 'hours')) // hooguit een uur geleden afgelopen
        );
      }());

      $scope.allowStop = (function () {
        return ($scope.allowEdit &&
          booking.status === 'accepted' &&
          booking.beginBooking && booking.endBooking &&
          moment().isAfter(moment(booking.beginBooking)) &&
          moment().isBefore(moment(booking.endBooking))
        );
      }());

      $scope.allowMap = $scope.allowEdit;
    }

    if ($scope.userPerspective === 'owner') {
      $scope.allowAcceptReject = booking.beginRequested && booking.endRequested;
      $scope.allowCancel = (function () {
        return (
          !$scope.allowAcceptReject &&
          booking.status === 'accepted' &&
          booking.beginBooking &&
          moment().isBefore(moment(booking.beginBooking)) // is nog niet begonnen
        );
      }());
    }
  }

  $scope.hasAcceptedTimeframe = function (booking) {
    return booking.beginBooking && ( ['cancelled', 'owner_cancelled', 'rejected'].indexOf(booking.status) < 0 );
  };

  $scope.hasRequestedTimeframe = function (booking) {
    return booking.beginRequested && ( ['cancelled', 'owner_cancelled', 'rejected'].indexOf(booking.status) < 0 );
  };

  $scope.setTimeframe = function(booking, addDays) {
    booking.beginRequested = moment().add('days', addDays).format(API_DATE_FORMAT);
  };

  angular.extend($scope, {
    map: {
      center: {
        latitude: $scope.resource.latitude,
        longitude: $scope.resource.longitude
      },
      draggable: true,
      markers: [{
        idKey: 1,
        latitude: $scope.resource.latitude,
        longitude: $scope.resource.longitude,
        title: $scope.resource.alias
      }], // an array of markers,
      zoom: 14,
      options: {
        scrollwheel: false
      }
    }
  });

  $scope.dateConfig = {
    //model
    modelFormat: API_DATE_FORMAT,
    formatSubmit: 'yyyy-mm-dd',

    //view
    viewFormat: 'DD-MM-YYYY',
    format: 'dd-mm-yyyy',
    //options
    selectMonths: true,
    container: 'body'
  };

  $scope.timeConfig = {
    //model
    modelFormat: API_DATE_FORMAT,
    formatSubmit: 'HH:i',

    //view
    viewFormat: 'HH:mm',
    format: 'HH:i',

    //options
    interval: 15,
    container: 'body'
  };

  $scope.openDoor = function(resource) {
    alertService.load();
    boardcomputerService.control({
      action: 'OpenDoorStartEnable',
      resource: resource.id,
      booking: booking ? booking.id : undefined
    })
    .then( function(result) {
      if(result === 'error') {
        return alertService.add('danger', result, 5000);
      }
      alertService.add('success', 'Boardcomputer opened door and enabled start', 3000);
    }, function(error) {
      alertService.add('danger', error.message, 5000);
    })
    .finally( function() {
      alertService.loaded();
    });
  };

  $scope.closeDoor = function(resource) {
    alertService.load();
    boardcomputerService.control({
      action: 'CloseDoorStartDisable',
      resource: resource.id,
      booking: booking ? booking.id : undefined
    })
    .then( function(result) {
      if(result === 'error') {
        return alertService.add('danger', result, 5000);
      }
      alertService.add('success', 'Boardcomputer closed door and disabled start', 3000);
    }, function(error) {
      alertService.add('danger', error.message, 5000);
    })
    .finally( function() {
      alertService.loaded();
    });
  };

  $scope.editBooking = function(booking) {
    if( !$scope.showBookingForm ) {
      $scope.showBookingForm = true;
      return;
    }
    alertService.load();
    bookingService.alterRequest({
      booking: booking.id,
      timeFrame: {
        startDate: booking.beginRequested,
        endDate: booking.endRequested
      },
      remark: booking.remarkRequester
    })
    .then(function (booking) {
      $scope.booking = booking;
      $scope.showBookingForm = false;
      initPermissions();
      if (booking.beginRequested) {
        alertService.add('info', $filter('translate')('BOOKING_ALTER_REQUESTED'), 5000);
      } else {
        alertService.add('success', $filter('translate')('BOOKING_ALTER_ACCEPTED'), 5000);
      }
    })
    .catch(errorHandler)
    .finally(function () {
      alertService.loaded();
    });
  };

  $scope.cancelBooking = function (booking) {
    dialogService.showModal(null, {
      closeButtonText: $translate.instant('CLOSE'),
      actionButtonText: $translate.instant('CONFIRM'),
      headerText: $translate.instant('CANCEL_BOOKING'),
      bodyText: $translate.instant('BOOKING.CANCEL.CONFIRM_TEXT')
    })
    .then(function () {
      alertService.load();
      bookingService.cancel({
        id: booking.id
      })
      .then(function (booking) {
        $scope.booking = booking;
        $scope.showBookingForm = false;
        alertService.add('success', $filter('translate')('BOOKING_CANCELED'), 5000);
        $state.go('owm.person.dashboard');
      })
      .catch(errorHandler)
      .finally(function () {
        alertService.loaded();
      });
    });
  };

  $scope.stopBooking = function (booking) {
    dialogService.showModal(null, {
      closeButtonText: $translate.instant('CLOSE'),
      actionButtonText: $translate.instant('CONFIRM'),
      headerText: $translate.instant('STOP_BOOKING'),
      bodyText: $translate.instant('BOOKING.STOP.CONFIRM_TEXT')
    })
    .then(function () {
      alertService.load();
      bookingService.stop({
        booking: booking.id
      })
      .then(function (booking) {
        $scope.booking = booking;
        $scope.showBookingForm = false;
        initPermissions();
        alertService.add('success', $filter('translate')('BOOKING_STOPPED'), 10000);
      })
      .catch(errorHandler)
      .finally(function () {
        alertService.loaded();
      });
    });
  };

  $scope.extendBooking = function(booking, hours) {
    booking.endRequested = moment(booking.endRequested).add('hours', hours).format(API_DATE_FORMAT);
  };

  $scope.acceptBooking = function (booking) {
    dialogService.showModal(null, {
      closeButtonText: $translate.instant('CLOSE'),
      actionButtonText: $translate.instant('CONFIRM'),
      headerText: $translate.instant('BOOKING.ACCEPT.TITLE'),
      bodyText: $translate.instant('BOOKING.ACCEPT.INTRO')
    })
    .then(function () {
      var params = {
        booking: booking.id
      };
      if ($scope.userInput.acceptRejectRemark) {
        params.remark = $scope.userInput.acceptRejectRemark;
      }
      alertService.load();
      bookingService.acceptRequest(params).then(function (booking) {
        $scope.booking = booking;
        initPermissions();
        alertService.add('success', $filter('translate')('BOOKING.ACCEPT.SUCCESS'), 5000);
      })
      .catch(errorHandler)
      .finally(function () {
        alertService.loaded();
      });
    });
  };

  $scope.rejectBooking = function (booking) {
    dialogService.showModal(null, {
      closeButtonText: $translate.instant('CLOSE'),
      actionButtonText: $translate.instant('CONFIRM'),
      headerText: $translate.instant('BOOKING.REJECT.TITLE'),
      bodyText: $translate.instant('BOOKING.REJECT.INTRO')
    })
    .then(function () {
      var params = {
        booking: booking.id
      };
      if ($scope.userInput.acceptRejectRemark) {
        params.remark = $scope.userInput.acceptRejectRemark;
      }
      alertService.load();
      bookingService.rejectRequest(params).then(function (booking) {
        $scope.booking = booking;
        initPermissions();
        alertService.add('success', $filter('translate')('BOOKING.REJECT.SUCCESS'), 5000);
      })
      .catch(errorHandler)
      .finally(function () {
        alertService.loaded();
      });
    });
  };

  function errorHandler (err) {
    if (err && err.level && err.message) {
      alertService.add(err.level, err.message, 5000);
    } else {
      alertService.addGenericError();
    }
  }


  // PRICE & AVAILABILITY

  $scope.price = null;
  $scope.isPriceLoading = false;

  var unbindWatch = $scope.$watch('showBookingForm', function (val) {
    if (val) {
      $scope.$watch('bookingRequest.beginRequested', onTimeFrameChange);
      $scope.$watch('bookingRequest.endRequested', onTimeFrameChange);
      unbindWatch();
    }
  });

  var timer;
  function onTimeFrameChange () {
    $timeout.cancel(timer);
    timer = $timeout(function () {
      loadAvailability().then(function (availability) {
        loadPrice();
      });
    }, 100);
  }

  $scope.availability = null;
  $scope.isAvailabilityLoading = false;
  function loadAvailability () {
    var dfd = $q.defer();
    var b = $scope.bookingRequest;
    var r = $scope.resource;
    $scope.availability = null;
    $scope.price = null;

    if (b.beginRequested && b.endRequested) {
      $scope.isAvailabilityLoading = true;
      resourceService.checkAvailability({
        resource: r.id,
        booking: b.id,
        timeFrame: {
          startDate: b.beginRequested,
          endDate: b.endRequested
        }
      })
      .then(function (isAvailable) {
        $scope.availability = { available: isAvailable ? 'yes' : 'no' };
        dfd.resolve($scope.availability);
      })
      .catch(function () {
        $scope.availability = { available: 'unknown' };
        dfd.resolve($scope.availability);
      })
      .finally(function () {
        $scope.isAvailabilityLoading = false;
      });
    }
    return dfd.promise;
  }

  function loadPrice () {
    var r = $scope.resource;
    var b = $scope.bookingRequest;
    var params;
    $scope.price = null;

    if ( $scope.availability &&
         ['yes','unknown'].indexOf($scope.availability.available) >= 0 &&
         (b.beginRequested && b.endRequested) ) {
      $scope.isPriceLoading = true;
      params = {
        resource : r.id,
        timeFrame: {
          startDate: b.beginRequested,
          endDate: b.endRequested
        }
      };
      if (b.contract) {
        params.contract = b.contract.id;
      }
      invoice2Service.calculatePrice(params).then(function (price) {
        $scope.price = price;
      })
      .finally(function () {
        $scope.isPriceLoading = false;
      });
    }
  }

  $scope.priceHtml = function (price) {
    var s = '';
    if (price.rent > 0) { s += 'Huur: ' + $filter('currency')(price.rent) + '<br/>'; }
    if (price.insurance > 0) { s += 'Verzekering: ' + $filter('currency')(price.insurance) + '<br/>'; }
    if (price.fee > 0) { s += 'Fee: ' + $filter('currency')(price.fee) + '<br/>'; }
    if (price.redemption > 0) { s+='Afkoop eigen risico: ' + $filter('currency')(price.redemption) + '<br/>'; }
    s += 'Totaal: ' + $filter('currency')(price.total);
    return s;
  };


  // INVOICES

  $scope.receivedInvoices = null;
  $scope.receivedInvoicesTotalAmount = 0;

  $scope.sentInvoices = null;
  $scope.sentInvoicesTotalAmount = 0;

  if ($scope.userPerspective === 'renter') {
    loadReceivedInvoices();
  }

  if ($scope.userPerspective === 'owner') {
    loadSentInvoices();
    loadReceivedInvoices();
  }

  function loadReceivedInvoices () {
    var booking = $scope.booking;
    invoice2Service.getReceived({ person: me.id, booking: booking.id }).then(function (invoices) {
      $log.debug('got received invoices', invoices);
      $scope.receivedInvoices = invoices || [];

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
      $scope.receivedInvoicesTotalAmount = hasError ? null : sum;
    });
  }

  function loadSentInvoices () {
    var booking = $scope.booking;
    invoice2Service.getSent({ person: me.id, booking: booking.id }).then(function (invoices) {
      $log.debug('got sent invoices', invoices);
      $scope.sentInvoices = invoices || [];

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
      $scope.sentInvoicesTotalAmount = hasError ? null : sum;
    });
  }

  $scope.openChatWith = openChatWith;
  function openChatWith(otherPerson) {
    var otherPersonName = $filter('fullname')(otherPerson);
    chatPopupService.openPopup(otherPersonName, otherPerson.id, booking.resource.id, booking.id);
  }


})
;
