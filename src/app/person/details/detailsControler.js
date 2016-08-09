'use strict';

angular.module('owm.person.details', [])


.controller('DetailsProfileController', function ($scope, $filter, $timeout, $translate, $window, person, alertService, personService, authService, me, dutchZipcodeService, voucherService, $q, appConfig, paymentService, bookingService, $log, $state) {
  console.log($scope);
  //person info
  var masterPerson = null;
  $scope.detailNumber = 0;
  $scope.showFirst = $scope.detailNumber === 0 ? true : false;
  $scope.showSecond = $scope.detailNumber === 1 ? true : false;
  $scope.showThird = $scope.detailNumber === 2 ? true : false;
  $scope.person = null;
  $scope.genderText = '';
  $scope.allowLicenseRelated = false;
  $scope.alerts = null;

  $scope.nextSection = function () {
    $scope.detailNumber++;
    // setHeight($scope.detailNumber);
  };
  $scope.prevSection = function (elementNumber, elementNumberTwo) {
    var number = JSON.parse(elementNumber);
    var numberTwo = JSON.parse(elementNumberTwo);

    angular.element('.details--card__section')[number].classList.add('prevSection');
    angular.element('.details--card__section')[numberTwo].classList.add('prevSection');
    $timeout(function () {
      angular.element('.details--card__section')[number].classList.remove('prevSection');
      angular.element('.details--card__section')[numberTwo].classList.remove('prevSection');
    }, 2000);
    $scope.detailNumber--;

  };
  var setHeight = function (elementNumber) {
    angular.element('.details--profile__overview')[0].style.height = angular.element('#personal-data')[0].clientHeight + 'px';
  };

  var unbindWatch = $scope.$watch('detailNumber', function (val) {
    $scope.showFirst = $scope.detailNumber === 0 ? true : false;
    $scope.showSecond = $scope.detailNumber === 1 ? true : false;
    $scope.showThird = $scope.detailNumber === 2 ? true : false;
  });
  setHeight($scope.detailNumber);

  initPerson(person);

  function initPerson(person) {
    masterPerson = person;
    $scope.person = angular.copy(person);

    // certain fields may only be edited if driver license is not yet checked by the office (see template)
    $scope.allowLicenseRelated = (person.driverLicenseStatus !== 'ok');

    // always show at least one phone number field
    ensurePhoneNumber();

    // Gender dropdown is bound to $scope.genderText instead of person.male
    // Binding to person.male doesn't work, because ng-options doesn't differentiate between false and null
    $scope.genderText = (person.male === true ? 'male' : (person.male === false ? 'female' : ''));

    $timeout(function () {
      $scope.personalDataForm.$setPristine();
    }, 0);

    initAlerts();
  }

  function initAlerts() {
    var p = $scope.person;
    var alerts = {
      personalData: (!p.firstName || !p.surname || !p.dateOfBirth),
      contactData: (!p.streetName || !p.streetNumber || !p.city || (!p.phoneNumbers || !p.phoneNumbers.length)),
      licenseData: (p.status === 'new')
    };
    $scope.alerts = alerts;
  }

  // PERSONAL DATA
  $scope.submitPersonalDataForm = function () {
    alertService.closeAll();
    alertService.load();
    var newProps = $filter('returnDirtyItems')(angular.copy($scope.person), $scope.personalDataForm);

    //add fields not in form
    if (newProps.zipcode || newProps.streetNumber) {
      newProps.streetName = $scope.person.streetName;
      newProps.city = $scope.person.city;
      newProps.latitude = $scope.person.latitude;
      newProps.longitude = $scope.person.longitude;
    }
    newProps.male = $scope.person.male;

    var firstName = $scope.person.firstName,
      surname = $scope.person.surname,
      dateOfBirth = $scope.person.dateOfBirth,
      male = $scope.genderText,
      phoneNumbers = $scope.person.phoneNumbers,
      zipcode = $scope.person.zipcode,
      streetNumber = $scope.person.streetNumber;

    // add phone numbers (not automatically included by 'returnDirtyItems')
    var shouldSavePhoneNumbers = $scope.person.phoneNumbers && (!angular.equals(masterPerson.phoneNumbers, $scope.person.phoneNumbers));
    if (shouldSavePhoneNumbers) {
      angular.forEach($scope.person.phoneNumbers, function (phoneNumber) {
        if (phoneNumber.number) {
          newProps.phoneNumbers = newProps.phoneNumbers || [];
          newProps.phoneNumbers.push({
            id: phoneNumber.id,
            number: phoneNumber.number,
            confidential: phoneNumber.confidential
          });
        }
      });

      if (!Object.keys(newProps).length) {
        // nothing to save
        $scope.personalDataForm.$setPristine();
        return;
      }
    }
    if (firstName && surname && dateOfBirth && male) {
      if (phoneNumbers) {
        if (streetNumber && zipcode) {
          personService.alter({
              person: person.id,
              newProps: newProps
            })
            .then(function (buggyPersonWithoutPhoneNumbers) {
              alertService.addSaveSuccess();
              initPerson($scope.person);
              $scope.nextSection();
            })
            .catch(function (err) {
              alertService.addError(err);
            })
            .finally(function () {
              alertService.loaded();
            });
        } else {
          alertService.add('danger', 'Vul je adres in zodat we je post kunnen sturen.', 10000);
          alertService.loaded();
        }
      } else {
        alertService.add('danger', 'Vul je telefoon nummmer in zodat we je kunnen berijken.', 10000);
        alertService.loaded();
      }
    } else {
      alertService.add('danger', 'Voordat je de auto kan huren moet je je persoonsgegevens invullen.', 10000);
      alertService.loaded();
    }
  };


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

  /*
   * remove all spaces
   */
  function stripWhitespace(str) {
    var out = str;
    while (out.indexOf(' ') >= 0) {
      out = out.replace(' ', '');
    }
    return out;
  }
  $scope.addPhone = addPhone;

  function addPhone() {
    $scope.person.phoneNumbers = $scope.person.phoneNumbers || [];
    $scope.person.phoneNumbers.push({
      number: '',
      type: 'mobile'
    });
  }

  $scope.$watch('[person.zipcode, person.streetNumber]', function (newValue, oldValue) {
    var country;

    if (newValue !== oldValue) {
      if (!(newValue[0] && newValue[1])) {
        return;
      }
      switch (($scope.person.country || '').toLowerCase()) {
      case 'nl':
      case 'nederland':
        country = 'nl';
        break;
      case 'be':
      case 'belgie':
      case 'belgië':
        country = 'be';
        break;
      default:
        country = 'nl';
      }

      $scope.zipcodeAutocompleting = true;
      dutchZipcodeService.autocomplete({
          country: country,
          zipcode: stripWhitespace(newValue[0]),
          streetNumber: newValue[1]
        })
        .then(function (data) {
          /*jshint sub: true */
          $scope.person.city = data[0].city;
          $scope.person.streetName = data[0].street;
          $scope.person.latitude = data[0].lat;
          $scope.person.longitude = data[0].lng;
        }, function (error) {
          if ($scope.person.zipcode !== newValue[0] || $scope.person.streetNumber !== newValue[1]) {
            //resolved too late
            return;
          }
          $scope.person.city = null;
          $scope.person.streetName = null;
          $scope.person.latitude = null;
          $scope.person.longitude = null;
        })
        .finally(function () {
          $scope.zipcodeAutocompleting = false;
        });
    }
  }, true);

  function ensurePhoneNumber() {
    if (!$scope.person.phoneNumbers || !$scope.person.phoneNumbers.length) {
      addPhone();
    }
  }

  // licence images
  var images = {
    front: null
  };

  $scope.images = images;
  $scope.isBusy = false;
  $scope.containsLicence = false;
  $scope.LicenceUploaded = false;
  $scope.licenceFileName = 'Selecteer je rijbewijs';

  angular.element('#licenseFrontFile').on('change', function (e) {
    $scope.$apply(function () {
      images.front = e.target.files[0];
      $scope.licenceFileName = e.target.files[0].name;
      angular.element('#licence-preview')[0].src = URL.createObjectURL(event.target.files[0]);
      $scope.containsLicence = true;
    });
  });
  $scope.cancelUpload = function () {
    $scope.containsLicence = false;
  };

  $scope.startUpload = function () {
    if (!images.front) {
      return;
    }
    $scope.isBusy = true;
    alertService.load();

    personService.addLicenseImages({
        person: me.id
      }, {
        frontImage: images.front
      })
      .then(function () {
        $scope.LicenceUploaded = true;
        alertService.add('success', 'Bedankt voor het uploaden van je rijbewijs', 5000);
        // reload user info (status may have changed as a result of uploading license)
        personService.me({
            version: 2
          }).then(function (person) {
            angular.extend(authService.user.identity, person);
          })
          // silently fail
          .catch(function (err) {
            $log.debug('error', err);
          })
          .finally(function () {
            // $state.go('owm.person.dashboard');

          });

      })
      .catch(function (err) {
        alertService.addError(err);
      })
      .finally(function () {
        alertService.loaded();
        $scope.isBusy = false;
      });
  };
  //booking
  var cachedBookings = {};
  $scope.busy = true;
  $scope.booking = {};
  $scope.requiredValue = null;
  alertService.load($scope);

  getRequiredValue().then(getBookings).finally(function () {
    alertService.loaded($scope);
    $scope.busy = false;
  });

  function getRequiredValue() {
    return voucherService.calculateRequiredCredit({
        person: me.id
      }).then(function (value) {

        if (value.bookings.length < 1) {
          // invoice2service.createBooking({
          //   booking: booking.id
          // }).then
        } else {
          $scope.requiredValue = value;
          return value;
        }

      })
      .catch(function (err) {
        alertService.addError(err);
      });
  }

  function getBookings(requiredValue) {
    if (!requiredValue.bookings || !requiredValue.bookings.length) {
      return true;
    }
    var results = [];
    requiredValue.bookings.forEach(function (booking, index) {
      results.push(cachedBookings[booking.id] ||
        bookingService.get({
          booking: booking.id
        }).then(function (_booking) {
          cachedBookings[_booking.id] = _booking;
          _booking.statusValue = checkStatus(_booking.approved);

          angular.extend(booking, _booking);
        })
      );
    });
    console.log(requiredValue.bookings);
    $scope.booking = requiredValue.bookings[0];
    return $q.all(results).catch(function (err) {
      alertService.addError(err);
    });
  }


  $scope.toggleRedemption = function (booking) {
    alertService.closeAll();
    alertService.load($scope);

    /* checkbox is already checked, so new value is now: */
    var newValue = booking.riskReduction;

    bookingService.alter({
        booking: booking.id,
        newProps: {
          riskReduction: newValue
        }
      })
      .then(function () {
        /* recalculate amounts */
        return getRequiredValue();
      })
      .then(function (requiredValue) {
        /* get bookings from cache */
        return getBookings(requiredValue);
      })
      .then(function () {
        booking.riskReduction = newValue;
      })
      .catch(function (err) {
        /* revert */
        booking.riskReduction = !!!booking.riskReduction;
        alertService.addError(err);
      })
      .finally(function () {
        alertService.loaded($scope);
      });
  };
  $scope.buyVoucher = function (value) {
    if (!value || value < 0) {
      return;
    }
    alertService.load($scope);
    voucherService.createVoucher({
        person: me.id,
        value: value
      })
      .then(function (voucher) {
        return paymentService.payVoucher({
          voucher: voucher.id
        });
      })
      .then(function (data) {
        if (!data.url) {
          throw new Error('Er is een fout opgetreden');
        }
        /* redirect to payment url */
        redirect(data.url);
      })
      .catch(function (err) {
        alertService.addError(err);
      })
      .finally(function () {
        alertService.loaded($scope);
      });
  };

  function redirect(url) {
    var redirectTo = appConfig.appUrl + $state.href('owm.finance.payment-result');
    $window.location.href = url + '?redirectTo=' + encodeURIComponent(redirectTo);
  }

  function checkStatus(approvedStatus) {
    if (approvedStatus === 'OK') {
      return true;
    } else {
      return false;
    }
  }
  //change status


});
