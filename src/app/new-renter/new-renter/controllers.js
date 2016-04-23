'use strict';

angular.module('owm.newRenter.controllers', [])

.controller('NewRenterController', function ($state, $scope, resource, booking, authService, contractService) {

  $scope.resource = resource;
  $scope.booking = booking;
  $scope.user = authService.user;

  $scope.$watch('user.isAuthenticated && !user.isPending', function (newValue) {
    if(newValue){
      $scope.person = authService.user.identity;
      checkCompleted();
    }
  });

  $scope.$watch('user.identity.id', function (id) {
    if(id) {
      contractService.forDriver({person: id}).
      then(function (contracts) {
        $scope.contracts = contracts;
        checkCompleted();
      });
    }
  });

  function checkCompleted () {
    var contracts = $scope.contracts;
    var person = $scope.person;
    var completed = contracts && contracts.length && person;

    completed = completed && person.status === 'active' || person.status === 'book-only';

    completed = completed && contracts && contracts.some(function (contract) {
      return contract.status === 'active';
    });

    if (completed) {
      $state.go('newRenter-booking', {
        resourceId: $scope.resource.id,
        startTime:  $scope.booking.startTime,
        endTime:    $scope.booking.endTime,
        discountCode: $scope.booking.discountCode
      });
    }
  }
})

.controller('NewRenterRegisterController', function ($scope, $state,
  dutchZipcodeService, authService, alertService, personService, $q
) {

  $scope.addPhone = function () {
    $scope.person.phoneNumbers = $scope.person.phoneNumbers || [];
    $scope.person.phoneNumbers.push({
      number: '',
      type: 'mobile'
    });
  };

  $scope.removePhone = function (index) {
    $scope.person.phoneNumbers.splice(index, 1);
  };

  $scope.license_front = null;
  $scope.person = {};
  $scope.addPhone();
  $scope.credentials = {};

  $scope.subscribe = function(credentials, person, license_front) {
    alertService.closeAll();
    alertService.load();

    $q(function(succ, fail) {
      return succ(authService.user.isAuthenticated);
    })
    .then(function (authenticated) {
      if(!authenticated) {

        return authService.oauthSubscribe({
          email: credentials.email,
          password: credentials.password,
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
        url: $state.href('newRenter-register', {
          resourceId: $scope.resource.id,
          startTime: $scope.booking.startTime,
          endTime: $scope.booking.endTime,
          discountCode: $scope.booking.discountCode
        }, {absolute: true})
      });
    }).then(function (me) {
      alertService.addSaveSuccess();
      alertService.loaded();

      // update user properties (e.g. status may have changed as a result of uploading license)
      angular.extend(authService.user.identity, me);

      if(me.status === 'active' || me.status === 'book-only' ) {
        $state.go('newRenter-deposit', {
          resourceId: $scope.resource.id,
          startTime:  $scope.booking.startTime,
          endTime:    $scope.booking.endTime,
          discountCode: $scope.booking.discountCode
        });
      }
    }).catch(function (err) {
      alertService.addError(err);
    }).finally(function () {
      alertService.loaded();
    });
  };

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
        $scope.person.phoneNumbers = me.phoneNumbers;

        if (!$scope.person.phoneNumbers || !$scope.person.phoneNumbers.length) {
          $scope.addPhone();
        }
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


.controller('NewRenterDepositController', function ($state, $scope, alertService, depositService, me) {
  $scope.data = { mandate: false };
  $scope.busy = false;

  $scope.payDeposit = function () {
    $scope.busy = true;
    alertService.load($scope);
    saveState();
    depositService.requestContractAndPay({
      person: me.id
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      $scope.busy = false;
      alertService.loaded($scope);
    });
  };

  function saveState () {
    sessionStorage.setItem('afterPayment', JSON.stringify({
      error: {
        stateName: $state.current.name,
        stateParams: {
          resourceId: $scope.resource.id,
          startTime:  $scope.booking.startTime,
          endTime:    $scope.booking.endTime,
          discountCode: $scope.booking.discountCode
        }
      },
      success: {
        stateName: 'newRenter-booking',
        stateParams: {
          resourceId: $scope.resource.id,
          startTime:  $scope.booking.startTime,
          endTime:    $scope.booking.endTime,
          discountCode: $scope.booking.discountCode
        }
      }
    }));
  }
})


.controller('NewRenterBookingController', function ($log, $scope, $q, $state, person, resource, booking, resourceQueryService, contractService, discountService, bookingService, alertService) {
  $scope.busy = true;
  $scope.errorMessage = null;

  // generate state params for return-url (in case of error)
  resourceQueryService.setTimeFrame({
    startDate: booking.startTime,
    endDate  : booking.endTime
  });
  $scope.resourceStateParams = angular.extend(resourceQueryService.createStateParams(), {
    city: resource.city,
    resourceId: resource.id,
    discountCode: booking.discountCode
  });
  $log.debug('return url', $state.href('owm.resource.show', $scope.resourceStateParams));

  alertService.load();

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
    }
    if (booking.discountCode) {
      return verifyDiscountCode().then(function () {
        return createBooking().then(function (newBooking) {
          return applyDiscountCode(newBooking).then(function () {
            // FIXME(jdb) IF APPLYING DISCOUNT CODE FAILS, WE CANNOT ROLL BACK THE BOOKING (design flaw)
            return newBooking;
          });
        });
      });
    } else {
      return createBooking();
    }
  })
  .then(function (booking) {
    $scope.errorMessage = null;
    $scope.b = booking;
  })
  .catch(function (err) {
    $scope.errorMessage = (err && err.message) ? err.message : 'Er is iets misgegaan bij het maken van de reservering.';
  })
  .finally(function () {
    alertService.loaded();
    $scope.busy = false;
  });

  // resolve if code is empty or valid, otherwise reject.
  function verifyDiscountCode () {
    if (!booking.discountCode) {
      return $q.when(true); // resolve
    }
    return contractService.forDriver({ person: person.id }).then(function getFirstContract (contracts) {
      if (contracts && contracts.length) {
        return contracts[0];
      } else {
        $log.debug('error: new user should have at least one contract');
        return $q.reject();
      }
    })
    .then(function isApplicableForContract (contract) {
      return discountService.isApplicable({
        resource: resource.id,
        person: person.id,
        contract: contract,
        discount: booking.discountCode,
        timeFrame: {
          startDate: booking.startTime,
          endDate: booking.endTime
        }
      })
      .then(function (result) {
        if (result && result.applicable) {
          $log.debug('discount code is applicable');
          return $q.when(true); // resolve
        } else {
          $log.debug('discount code not applicable');
          return $q.reject(new Error('De kortingscode die je had opgegeven kon niet worden toegepast.'));
        }
      });
    });
  }

  function createBooking () {
    return bookingService.create({
      person: person.id,
      resource: resource.id,
      timeFrame: {
        startDate: booking.startTime,
        endDate: booking.endTime
      }
    });
  }

  // resolve if code is empty or has been successfully applied, otherwise reject.
  function applyDiscountCode (newBooking) {
    if (!booking.discountCode) {
      $log.debug('no discount code to apply');
      return $q.when(true); // resolve
    }
    else {
      return discountService.apply({
        booking: newBooking.id,
        discount: booking.discountCode
      })
      .then(function () {
        $log.debug('discount code applied');
      });
    }
  }

})
;
