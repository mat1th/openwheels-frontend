'use strict';

angular.module('owm.person.details', [])

.controller('DetailsProfileController', function ($scope, $filter, $timeout, $translate, person, alertService, personService, authService, dutchZipcodeService) {

  var masterPerson = null;
  $scope.person = null;
  $scope.genderText = '';
  $scope.allowLicenseRelated = false;
  $scope.alerts = null;
  $scope.contactFormProcessing = false;

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

    console.log($scope.personalDataForm);
    $scope.contactFormProcessing = true;
    personService.alter({
        person: person.id,
        newProps: newProps
      })
      .then(function (buggyPersonWithoutPhoneNumbers) {
        alertService.addSaveSuccess();
        initPerson($scope.person);
      })
      .catch(function (err) {
        alertService.addError(err);
      })
      .finally(function () {
        $scope.contactFormProcessing = false;
        alertService.loaded();
      });
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


});
