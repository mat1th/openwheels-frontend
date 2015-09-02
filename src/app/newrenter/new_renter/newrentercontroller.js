'use strict';

angular.module('owm.newrenter')

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
  dutchZipcodeService, authService, alertService, personService, $q
) {
  
  $scope.license_front = null;
  $scope.person = { };
  
  
  $scope.subscribe = function(email, password, person, license_front) {
    alertService.closeAll();
    alertService.load();
    
    $q(function(succ, fail) {
      return succ(authService.user.isAuthenticated);
    })
    .then(function (authenticated) {
      if(!authenticated) {
        return authService.oauthSubscribe({
          email: email,
          password: password,
          other: person
        });
      }

      return personService.alter({
        person: authService.user.identity.id,
        newProps: person
      }).then(function (new_user) {
        for (var key in authService.user.identity) {
          if (authService.user.identity.hasOwnProperty(key) && new_user.hasOwnProperty(key)) {
            authService.user.identity[key] = new_user[key];
          }
        }
        return new_user;
      });
    }).then(function (me) {
      if(license_front) {
        return personService.addLicenseImages(
          {person: me.id},
          {frontImage: license_front}
        );
      }
      return personService.emailBookingLink({
        person: me.id,
        url: $state.href('new_renter-create_booking', {
          resourceId: $scope.resource.id,
          startTime: $scope.booking.startTime,
          endTime: $scope.booking.endTime
        }, {absolute: true})
      });
    }).then(function (me) {
      alertService.addSaveSuccess();
      alertService.loaded();
      if(me.status === 'active' || me.status === 'book-only' ) {
        $state.go('new_renter-betaal_borg', {
          resourceId: $scope.resource.id,
          startTime:  $scope.booking.startTime,
          endTime:    $scope.booking.endTime
        });
      }
    }, function (error) {
      alertService.addError(error);
      alertService.loaded();
    });
    
  };
//  
  $scope.$watch('user.isAuthenticated && !user.isPending', function (newValue) {
    if(newValue){
      authService.authenticatedUser()
      .then(function (me) {
        $scope.person.firstName = me.firstName;
        $scope.person.preposition = me.preposition;
        $scope.person.surname = me.surname;
        $scope.person.dateOfBirth = me.dateOfBirth;
        $scope.person.zipcode = me.zipcode;
        $scope.person.streetNumber = me.streetNumber;
      });
    }
  });
  
  $scope.$watch('[person.zipcode, person.streetNumber]', function( newValue, oldValue ){
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
      $scope.person = authService.user.identity;
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