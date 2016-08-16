'use strict';

angular.module('owm.person.details', [])


.controller('DetailsProfileController', function ($scope, $filter, $timeout, $translate, $window, $log, $state, $stateParams, person, alertService, personService, authService, me, dutchZipcodeService, voucherService, $q, appConfig, paymentService, bookingService, invoice2Service, discountService, API_DATE_FORMAT, $anchorScroll) {
  // console.log($scope);
  $scope.isBusy = false;

  //person info
  var masterPerson = null;
  $scope.pageNumber = JSON.parse($stateParams.pageNumber);
  $scope.showFirst = $scope.pageNumber === 1 ? true : false;
  $scope.showSecond = $scope.pageNumber === 2 ? true : false;
  $scope.showThird = $scope.pageNumber === 3 ? true : false;
  $scope.person = null;
  $scope.genderText = '';
  $scope.allowLicenseRelated = false;
  $scope.alerts = null;

  //details section vars
  $scope.addPhone = addPhone;
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

  //booking section
  var URL_DATE_TIME_FORMAT = 'YYMMDDHHmm';
  var cachedBookings = {};
  $scope.priceCalculated = false;
  $scope.booking = {};
  $scope.requiredValue = null;
  $scope.isAvailable = true;
  $scope.isbooking = $stateParams.resourceId !== undefined ? true : false;
  $scope.bookingStart = moment($stateParams.startDate).format(URL_DATE_TIME_FORMAT);
  $scope.bookingEnd = moment($stateParams.endDate).format(URL_DATE_TIME_FORMAT);

  //licence upload sections
  // licence images
  var images = {
    front: null
  };

  $scope.images = images;
  $scope.containsLicence = false;
  $scope.LicenceUploaded = false;
  $scope.licenceFileName = 'Selecteer je rijbewijs';

  // toggle the sections
  $scope.nextSection = function () {
    if ($scope.pageNumber < 3) {
      $scope.pageNumber++;
      $state.transitionTo('owm.person.details', {
        pageNumber: $scope.pageNumber
      });
      $anchorScroll('scroll-to-top-anchor');
    }
    // setHeight($scope.pageNumber);
  };
  $scope.prevSection = function (elementNumber, elementNumberTwo) {
    if ($scope.pageNumber > 1) {
      var number = JSON.parse(elementNumber);
      var numberTwo = JSON.parse(elementNumberTwo);

      angular.element('.details--card__section')[number].classList.add('prevSection');
      angular.element('.details--card__section')[numberTwo].classList.add('prevSection');
      $timeout(function () {
        angular.element('.details--card__section')[number].classList.remove('prevSection');
        angular.element('.details--card__section')[numberTwo].classList.remove('prevSection');
      }, 2000);
      $scope.pageNumber--;
      $state.transitionTo('owm.person.details', {
        pageNumber: $scope.pageNumber
      });
      $anchorScroll('scroll-to-top-anchor');
    }
  };
  // toggle the sections

  var setHeight = function (elementNumber) {
    angular.element('.details--profile__overview')[0].style.height = angular.element('#personal-data')[0].clientHeight + 'px';
  };

  var unbindWatch = $scope.$watch('detailNumber', function (val) {
    $scope.showFirst = $scope.pageNumber === 1 ? true : false;
    $scope.showSecond = $scope.pageNumber === 2 ? true : false;
    $scope.showThird = $scope.pageNumber === 3 ? true : false;
  });
  setHeight($scope.pageNumber);

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
    console.log($scope.person);

    $scope.date = {
      day: Number(moment($scope.person.dateOfBirth).format('DD')),
      month: Number(moment($scope.person.dateOfBirth).format('MM')),
      year: Number(moment($scope.person.dateOfBirth).format('YYYY'))
    };

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
    alertService.loaded($scope);
    $scope.alerts = alerts;
  }

  //date input field
  var autoDateInput = angular.element('.autoDateInput')[0];
  autoDateInput.onkeyup = function (e) {
    var target = e.srcElement;
    var maxLength = parseInt(target.attributes.maxlength.value, 10);
    var myLength = target.value.length;
    if (myLength >= maxLength) {
      var next = target;
      next = next.nextElementSibling;
      if (next !== null) {
        if (next.tagName.toLowerCase() === 'input') {
          next.focus();
        }
      }
    }
  };


  // PERSONAL DATA
  $scope.submitPersonalDataForm = function () {
    alertService.closeAll();
    alertService.load();
    $scope.person.dateOfBirth = $scope.date.year + '-' + $scope.date.month + '-' + $scope.date.day;
    var newProps = $filter('returnDirtyItems')(angular.copy($scope.person), $scope.personalDataForm);

    //add fields not in form
    if (newProps.zipcode || newProps.streetNumber) {
      newProps.streetName = $scope.person.streetName;
      newProps.city = $scope.person.city;
      newProps.latitude = $scope.person.latitude;
      newProps.longitude = $scope.person.longitude;
    }

    newProps.male = $scope.person.male;
    newProps.dateOfBirth = $scope.person.dateOfBirth;

    var firstName = $scope.person.firstName,
      surname = $scope.person.surname,
      year = $scope.date.year,
      month = $scope.date.month,
      day = $scope.date.day,
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
    if (firstName && surname && year && month && day && male) {

      if (phoneNumbers) {
        // console.log($scope.person);
        if (streetNumber && zipcode) {
          personService.alter({
              person: person.id,
              newProps: newProps
            })
            .then(function (buggyPersonWithoutPhoneNumbers) {
              initPerson($scope.person);
              $scope.nextSection();
            })
            .catch(function (err) {
              alertService.addError(err);
            })
            .finally(function () {});
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

          });
      })
      .catch(function (err) {
        alertService.addError(err);
      })
      .finally(function () {
        $scope.isBusy = false;
        $scope.createBookingFlow();
      });
  };
  //booking
  $scope.createBookingFlow = function () {
    alertService.load();
    $scope.isBusy = true;
    console.log(1);
    var resourceId = $stateParams.resourceId,
      discountCode = $stateParams.discountCode,
      remarkRequester = $stateParams.remarkRequester,
      riskReduction = $stateParams.riskReduction,
      timeFrame = {
        startDate: moment($stateParams.startDate).format(API_DATE_FORMAT),
        endDate: moment($stateParams.endDate).format(API_DATE_FORMAT)
      };
    if ($scope.isbooking && !$scope.priceCalculated) {
      bookingService.create({
        resource: resourceId,
        timeFrame: timeFrame,
        person: me.id,
        remark: remarkRequester
      }).then(function (value) {
        $scope.isAvailable = true;
        if (discountCode !== undefined) {
          //set the discount
          discountService.apply({
            booking: value.id,
            discount: discountCode
          }).catch(function (err) {
            $scope.isBusy = false;
            alertService.addError(err);
          });
        }
        return value;
      }).then(function (value) {
        $scope.nextSection();
        getRequiredValue(value).then(getBookings).finally(function () {
          alertService.loaded($scope);
          $scope.booking = $scope.requiredValue.bookings[0];
          $scope.priceCalculated = true;
        });
      }).catch(function (err) {
        if (err.message === 'De auto is niet beschikbaar') {
          $scope.isAvailable = false;
          $scope.isBusy = false;
          $scope.nextSection();
        }
        alertService.addError(err);
        alertService.loaded();
        $scope.isBusy = false;
      });
    } else {
      $scope.isAvailable = true;
      $scope.nextSection();
      $scope.isBusy = false;
    }
  };

  $scope.skipFlow = function () {
    personService.emailBookingLink({
      person: me.id,
      url: $state.href('owm.person.details', {
        pageNumber: $scope.pageNumber,
        city: $stateParams.city,
        resourceId: $stateParams.resourceId,
        startDate: $stateParams.startDate,
        endDate: $stateParams.endDate,
        discountCode: $stateParams.discountCode,
        remarkRequester: $stateParams.remarkRequester,
        riskReduction: $stateParams.riskReduction
      }, {
        absolute: true
      })
    });
    $state.go('owm.person.intro');
  };

  function getRequiredValue(bookingData) {
    var bookingObject = {};
    if (bookingData.approved === 'BUY_VOUCHER') {
      return voucherService.calculateRequiredCredit({
          person: me.id
        }).then(function (value) {
          $scope.requiredValue = value;

          return value;
        })
        .catch(function (err) {
          alertService.addError(err);
        });
    } else {
      return invoice2Service.calculateBookingPrice({
        booking: bookingData.id
      }).then(function (value) {
        bookingObject = {
          bookings: [{
            id: bookingData.id,
            title: 'Rit op ',
            booking_price: value,
            km_price: 0,
            discount: 0,
            paid_amount: 0
          }]
        };
        $scope.requiredValue = bookingObject;
        return bookingObject;
      });
    }
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
    return $q.all(results).catch(function (err) {
      alertService.addError(err);
    });
  }
  $scope.redemptionPending = {}; /* by booking id */

  $scope.toggleRedemption = function (booking) {
    alertService.closeAll();
    alertService.load($scope);

    /* checkbox is already checked, so new value is now: */
    var newValue = $scope.booking.riskReduction;

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
        $scope.booking.riskReduction = newValue;
      })
      .catch(function (err) {
        /* revert */
        $scope.booking.riskReduction = !!!$scope.booking.riskReduction;
        alertService.addError(err);
      })
      .finally(function () {});
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
