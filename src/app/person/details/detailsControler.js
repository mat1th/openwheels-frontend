'use strict';

angular.module('owm.person.details', [])


.controller('DetailsProfileController', function ($scope, $filter, $timeout, $translate, $window, $log, $state, $stateParams, $mdDialog, discountService, contractService, account2Service, person, alertService, personService, authService, me, dutchZipcodeService, voucherService, $q, appConfig, paymentService, bookingService, invoice2Service, API_DATE_FORMAT, $anchorScroll) {
  $scope.isBusy = false;

  //person info
  var masterPerson = null;
  $scope.pageNumber = JSON.parse($stateParams.pageNumber);
  $scope.showFirst = $scope.pageNumber === 1 ? true : false;
  $scope.showSecond = $scope.pageNumber === 2 ? true : false;
  $scope.showThird = $scope.pageNumber === 3 ? true : false;
  $scope.person = null;
  $scope.genderText = '';
  $scope.checkedLater = false;
  $scope.allowLicenseRelated = false;
  $scope.alerts = null;
  $scope.accountApproved = false;

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
  $scope.containsLicence = me.driverLicense !== (null || undefined) ? true : false;
  $scope.licenceUploaded = me.driverLicense !== (null || undefined) ? true : false;
  $scope.licenceImage = me.driverLicense || 'assets/img/rijbewijs_voorbeeld.jpg'; //WHAT IS THE URL??
  $scope.licenceFileName = 'Selecteer je rijbewijs';

  // toggle the sections
  $scope.nextSection = function () {
    if ($scope.pageNumber < 3) {
      $scope.pageNumber++;
      goToNextState($scope.pageNumber);
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
      goToNextState($scope.pageNumber);
      $anchorScroll('scroll-to-top-anchor');
    }
  };

  function goToNextState(stateNumber, bookingId) {
    $state.transitionTo('owm.person.details', { // should register
      pageNumber: stateNumber,
      city: $stateParams.city,
      resourceId: $stateParams.resourceId,
      bookingId: bookingId || $stateParams.bookingId,
      startDate: $stateParams.startDate,
      endDate: $stateParams.endDate,
      discountCode: $stateParams.discountCode,
      remarkRequester: $stateParams.remarkRequester,
      riskReduction: $stateParams.riskReduction
    });
  }
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

    $scope.date = {
      day: Number(moment($scope.person.dateOfBirth).format('DD')),
      month: Number(moment($scope.person.dateOfBirth).format('MM')),
      year: Number(moment($scope.person.dateOfBirth).format('YYYY'))
    };

    $timeout(function () {
      $scope.personalDataForm.$setPristine();
    }, 0);

    account2Service.forMe({
      'onlyApproved': true
    }).then(function (value) {
      if (value.length > 0) {
        $scope.accountApproved = true;
      }

    });

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
      city = $scope.person.city,
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
        if (streetNumber && zipcode && city) {
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
        alertService.add('danger', 'Vul je telefoonnummmer in zodat we je kunnen bellen.', 10000);
        alertService.loaded();
      }
    } else {
      alertService.add('danger', 'Voordat je de auto kunt huren, moet je je persoonsgegevens invullen.', 10000);
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
      $scope.licenceImage = URL.createObjectURL(event.target.files[0]);
      $scope.containsLicence = true;
    });
  });
  $scope.cancelUpload = function () {
    $scope.containsLicence = false;
  };
  $scope.startUpload = function () {
    if (me.driverLicense === null || me.driverLicense === undefined) {
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
          $scope.nextSection();
        });
    } else {
      $scope.nextSection();
    }
  };
  //the button on the upload linece page
  $scope.skipFlow = function () {
    personService.emailBookingLink({
      person: me.id,
      url: $state.href('owm.person.details', {
        pageNumber: $scope.pageNumber,
        city: $stateParams.city,
        resourceId: $stateParams.resourceId,
        bookingId: $stateParams.bookingId,
        startDate: $stateParams.startDate,
        endDate: $stateParams.endDate,
        discountCode: $stateParams.discountCode,
        remarkRequester: $stateParams.remarkRequester,
        riskReduction: $stateParams.riskReduction
      }, {
        absolute: true
      })
    });
    $scope.checkedLater = true;
  };
  //booking
  var resourceId = $stateParams.resourceId,
    bookingId = $stateParams.bookingId,
    city = $stateParams.city,
    discountCode = $stateParams.discountCode,
    remarkRequester = $stateParams.remarkRequester,
    riskReduction = $stateParams.riskReduction,
    timeFrame = {
      startDate: moment($stateParams.startDate).format(API_DATE_FORMAT),
      endDate: moment($stateParams.endDate).format(API_DATE_FORMAT)
    };
  $scope.createBookingFlow = function () {
    alertService.load();
    $scope.isBusy = true;
    if ($scope.isbooking) { //check if the recoure id is in the url
      if (bookingId) { //check if there is a bookingId in the url
        bookingService.get({
          booking: bookingId
        }).then(function (value) {
          $scope.isAvailable = true;
          getVoucherPrice(value.id);
        });
      } else { //if there is no booking Id in the url
        if (discountCode !== undefined) { //check if there is a discount code
          //set the discount
          return verifyDiscountCode().then(function (value) {
            if (value === true) {
              return createBooking().then(function (value) {
                return addDiscount(value).then(function (value) {
                  // final
                  alertService.loaded();
                  $scope.isBusy = false;
                  $scope.nextSection();
                });
              });
            } else {
              showDialog('De kortingscode die je hebt ingevuld is helaas niet van toepassing op deze rit. Wil je de boeking alsnog maken?');
            }
          });
        } else {
          return createBooking().then(function (value) {});
        }
      }
    }
  };

  function createBooking() {
    return bookingService.create({ //creat a booking
      resource: resourceId,
      timeFrame: timeFrame,
      person: me.id,
      remark: remarkRequester
    }).then(function (value) { //go to an other state
      goToNextState(3, value.id); //set the booking id in the url
      $scope.isAvailable = true; //set isAvailable to true to render the table
      return value;
    }).catch(function (err) {
      if (err.message === 'De auto is niet beschikbaar') {
        $scope.isAvailable = false; //set isAvailable to false to show the trip is not Available page
      } else {
        alertService.addError(err); //there is something wrong so show a error
      }
      alertService.loaded();
      $scope.isBusy = false;
      $scope.nextSection();
    });
  }

  function addDiscount(value) {
    return discountService.apply({ //apply the discount code
      booking: value.id,
      discount: discountCode
    }).catch(function (err) {
      $scope.isBusy = false;
      alertService.addError(err); //if there is something wrong show a err
    });
  }


  //check if the discount is applicable
  function verifyDiscountCode() {
    if (!$stateParams.discountCode) {
      return;
    }
    return contractService.forDriver({
      person: person.id
    }).then(function getFirstContract(contracts) {
      if (contracts && contracts.length) {

        return contracts[0];
      } else {
        return false;
      }
    }).then(function (contract) {
      return discountService.isApplicable({
          resource: resourceId,
          person: me.id,
          contract: contract.id,
          discount: discountCode,
          timeFrame: timeFrame
        })
        .then(function (result) {
          if (result && result.applicable) {
            $log.debug('discount code is applicable');
            return true; // resolve
          } else {
            $log.debug('discount code not applicable');
            return false;
          }
        }).catch(function (err) {
          return false;
        });
    });
  }

  function showDialog(content) {
    var confirm = $mdDialog.confirm()
      .title('kortingscode')
      .textContent(content)
      .ok('Ja')
      .cancel('Nee');
    $mdDialog.show(confirm).then(function () {
      return createBooking().then(function (value) {
        // final
        alertService.loaded();
        $scope.isBusy = false;
        $scope.nextSection();
      });
    }, function () {
      $state.go('owm.resource.show', {
        resourceId: resourceId,
        city: city
      });
      return false;
    });
  }

  if (JSON.parse($stateParams.pageNumber) === 3) {
    $scope.createBookingFlow();
  }

  function getVoucherPrice(bookingId) {
    var bookingObject = {};
    return voucherService.calculateRequiredCreditForBooking({
      booking: bookingId
    }).then(function (value) {
      bookingObject = {
        bookings: [{
          id: bookingId,
          title: 'Rit op ',
          booking_price: value,
          km_price: value.kmPrice,
          discount: value.discount
        }]
      };
      $scope.requiredValue = bookingObject;
      $scope.booking = bookingObject.bookings[0];

      return bookingObject;
    }).then(function () {
      $scope.priceCalculated = true;
      alertService.loaded();
      $scope.isBusy = false;
    }).catch(function (err) {
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
        return getVoucherPrice();
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

  // to buy the vouchure
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
  //redireceht to the pay service
  function redirect(url) {
    var redirectTo = appConfig.appUrl + $state.href('owm.finance.payment-result');
    $window.location.href = url + '?redirectTo=' + encodeURIComponent(redirectTo);
  }



});
