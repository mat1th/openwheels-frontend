'use strict';

angular.module('owm.resource.newrenter', [
  'datetimeDirective'
])

.controller('BorgController', function ($scope, $state, $sce) {
  $scope.purchaseID = $scope.user.identity.id +' ' + (new Date()).getTime().toString(16);
  $scope.endpoint =  $sce.trustAsResourceUrl('https://idealtest.rabobank.nl/ideal/mpiPayInitRabo.do');
  $scope.amount = '100';
  $scope.urlCancel = $state.href('new_renter-return_borg', {
    state:      'cancel',
    resourceId: $scope.resource.id,
    startTime:  $scope.booking.startTime,
    endTime:    $scope.booking.endTime
  }, {absolute: true});
  $scope.urlSuccess = $state.href('new_renter-bookresource', {
    resourceId: $scope.resource.id,
    startTime:  $scope.booking.startTime,
    endTime:    $scope.booking.endTime
  }, {absolute: true});
  $scope.urlError = $state.href('new_renter-return_borg', {
    state:      'error',
    resourceId: $scope.resource.id,
    startTime:  $scope.booking.startTime,
    endTime:    $scope.booking.endTime
  }, {absolute: true});
})

.controller('RegistreerController', function ($scope, $state,
  dutchZipcodeService, authService, alertService, personService
) {
  
  $scope.license_front = null;
  $scope.person = {
  };
  
  $scope.subscribe = function(email, password, person, license_front) {
    alertService.closeAll();
    alertService.load();
    
    authService.oauthSubscribe({
      email: email,
      password: password,
      other: person
    })
    .then(function (me) {
      return personService.addLicenseImages(
        {person: me.id},
        {frontImage: license_front}
      );
    })
    .then(function (data) {
      alertService.addSaveSuccess();
      alertService.loaded();
      $state.go('new_renter-betaal_borg', {
        resourceId: $scope.resource.id,
        startTime:  $scope.booking.startTime,
        endTime:    $scope.booking.endTime
      });
    }, function (error) {
      alertService.addError(error);
      alertService.loaded();
    });
  };
  /*
   * remove all spaces
   */
  function stripWhitespace (str) {
    var out = str;
    while (out.indexOf(' ') >= 0) {
      out = out.replace(' ', '');
    }
    return out;
  }
  
  $scope.$watch('[person.zipcode, person.streetNumber]', function( newValue, oldValue ){
    var country = 'nl';

    if( newValue !== oldValue ){
      if( !( newValue[0] && newValue[1] )) {
        return;
      }

      $scope.zipcodeAutocompleting = true;
      dutchZipcodeService.autocomplete({
        country: country,
        zipcode: stripWhitespace(newValue[0]),
        streetNumber: newValue[1]
      })
      .then(function(data) {
        /*jshint sub: true */
        $scope.person.city = data[0].city;
        $scope.person.streetName = data[0].street;
        $scope.person.latitude = data[0].lat;
        $scope.person.longitude = data[0].lng;
      }, function(error) {
        if($scope.person.zipcode !== newValue[0] || $scope.person.streetNumber !== newValue[1] ) {
          //resolved too late
          return;
        }
        $scope.person.city = null;
        $scope.person.streetName = null;
        $scope.person.latitude = null;
        $scope.person.longitude = null;
      })
      .finally(function() {
        $scope.zipcodeAutocompleting = false;
      })
      ;
    }
  }, true);

  $scope.dateConfig = {
    //model
    modelFormat: 'YYYY-MM-DD',
    formatSubmit: 'yyyy-mm-dd',

    //view
    viewFormat: 'DD-MM-YYYY',
    format: 'dd-mm-yyyy',

    //options
    selectMonths: true,
    selectYears: '100',
    max: true
  };
})

.controller('NewuserCreateBookingController', function ($scope, $q, person, resource, booking, bookingService) {
  bookingService.getBookingList({
    person: person.id,
    timeFrame: {
      startDate: booking.startTime,
      endDate: booking.endTime
    },
  })
  .then(function (bookings) {
    return bookings.filter(function (elm) {
      return elm.resource.id === resource.id;
    });
  })
  .then(function (bookings) {
    if(bookings.length) {
      return bookings[0];
    } else {
      return bookingService.create({
        person: person.id,
        resource: resource.id,
        timeFrame: {
          startDate: booking.startTime,
          endDate: booking.endTime
        },
      });
    }
  })
  .then(function (booking) {
    console.log(booking);
    $scope.b = booking;
  });
})

.controller('NewRenterController', function ($scope, resource,
    booking, authService, contractService) {
  
  //alertService.loaded();
  $scope.resource = resource;
  $scope.booking = booking;
  $scope.user = authService.user;
  
  $scope.$watch('user.isAuthenticated && !user.isPending', function (newValue) {
    if(newValue){
      authService.authenticatedUser()
      .then(function (me) {
        $scope.person = me;
      });
    }
  });
  
  $scope.$watch('user.identity.id', function (id) {
    if(id) {
      contractService.forDriver({person: id}).
      then(function (contracts) {
        $scope.contracts = contracts;
      });
    }
  });
})

;