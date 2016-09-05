'use strict';

angular.module('owm.person.profile', [])

.controller('PersonProfileController', function ($scope, $filter, $timeout, $translate, person, alertService, personService, authService, dutchZipcodeService) {

  var masterPerson = null;
  $scope.person = null;
  $scope.genderText = '';
  $scope.allowLicenseRelated = false;
  $scope.alerts = null;
  $scope.contactFormProcessing = false;

  initPerson(person);

  function initPerson (person) {
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
      $scope.contactDataForm.$setPristine();
      $scope.settingsForm.$setPristine();
    }, 0);

    initAlerts();
  }

  function initAlerts () {
    var p = $scope.person;
    var alerts = {
      personalData: (!p.firstName || !p.surname || !p.dateOfBirth),
      contactData : (!p.streetName || !p.streetNumber || !p.city || (!p.phoneNumbers || !p.phoneNumbers.length)),
      licenseData : (p.status === 'new')
    };
    $scope.alerts = alerts;
  }

  // PERSONAL DATA
  $scope.submitPersonalDataForm = function() {
    alertService.closeAll();
    alertService.load();
    var newProps = $filter('returnDirtyItems')( angular.copy($scope.person), $scope.personalDataForm);
    personService.alter({
      id: person.id,
      newProps: newProps
    })
    .then(function (buggyPersonWithoutPhoneNumbers) {
      alertService.addSaveSuccess();
      initPerson($scope.person);
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function() {
      alertService.loaded();
    });
  };

  // CONTACT DATA
  $scope.submitContactDataForm = function() {
    var newProps = $filter('returnDirtyItems')( angular.copy($scope.person), $scope.contactDataForm);

    //add fields not in form
    if(newProps.zipcode || newProps.streetNumber){
      newProps.streetName = $scope.person.streetName;
      newProps.city = $scope.person.city;
      newProps.latitude = $scope.person.latitude;
      newProps.longitude = $scope.person.longitude;
    }

    // add phone numbers (not automatically included by 'returnDirtyItems')
    var shouldSavePhoneNumbers = $scope.person.phoneNumbers && (!angular.equals(masterPerson.phoneNumbers, $scope.person.phoneNumbers));
    if (shouldSavePhoneNumbers) {
      angular.forEach($scope.person.phoneNumbers, function (phoneNumber) {
        if (phoneNumber.number) {
          newProps.phoneNumbers = newProps.phoneNumbers || [];
          newProps.phoneNumbers.push({
            id          : phoneNumber.id,
            number      : phoneNumber.number,
            confidential: phoneNumber.confidential
          });
        }
      });
    }

    if (!Object.keys(newProps).length) {
      // nothing to save
      $scope.contactDataForm.$setPristine();
      return;
    }

    alertService.closeAll();
    alertService.load();
    $scope.contactFormProcessing = true;
    personService.alter({
      id: person.id,
      newProps: newProps
    })
    .then(function (buggyPersonWithoutPhoneNumbers) {
      // reload person to get updated phone numbers, because backend returns a person without phoneNumbers
      return authService.me(!!'forceReload').then(function (me) {
        alertService.addSaveSuccess();
        initPerson(me);
      });
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      $scope.contactFormProcessing = false;
      alertService.loaded();
    });
  };

  // SETTINGS
  $scope.submitSettingsForm = function() {
    var newProps = $filter('returnDirtyItems')( angular.copy($scope.person), $scope.settingsForm);

    alertService.closeAll();
    alertService.load();

    personService.alter({
      id: person.id,
      newProps: newProps
    })
    .then(function (buggyPersonWithoutPhoneNumbers) {
      alertService.addSaveSuccess();
      initPerson($scope.person);
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function() {
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

  $scope.$watch(function () {
    return $translate.use();
  }, function (lang) {
    if (lang) {
      $scope.visibilityOptions = [
        {label: $translate.instant('PROFILE_VISIBILITY_PUBLIC'), value: 'public'},
        {label: $translate.instant('PROFILE_VISIBILITY_RENTALRELATIONS'), value: 'rentalrelation_only'},
        {label: $translate.instant('PROFILE_VISIBILITY_MEMBERS'), value: 'members'}
      ];

      $scope.preferenceOptions = [
        {label: $translate.instant('USER_PREFERENCE_RENTER'), value: 'renter',},
        {label: $translate.instant('USER_PREFERENCE_OWNER'), value: 'owner'},
        {label: $translate.instant('USER_PREFERENCE_BOTH'), value: 'both'}
      ];

      $scope.emailPreferenceOptions = [
        {label: $translate.instant('EMAIL_PREFERENCE_ALL'), value: 'all'},
        {label: $translate.instant('EMAIL_PREFERENCE_SOME'), value: 'some'},
        {label: $translate.instant('EMAIL_PREFERENCE_MINIMUM'), value: 'min'}
      ];

      // note that the backend expects literal values 'België' or 'Nederland'
      $scope.countryOptions = [
        {label: 'Nederland', value: 'Nederland'},
        {label: 'België', value: 'België'}
      ];
    }
  });

  $scope.$watch('person.preference', function( newValue ){
    if( newValue === 'renter' ){
      $scope.person.slug = null;
    } else {
      $scope.person.slug = $scope.person.slug || masterPerson.slug;
    }
  });

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
    var country;

    if( newValue !== oldValue ){
      if( !( newValue[0] && newValue[1] )) {
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

  $scope.removePhone = function(phone, index) {
    if (!phone.id) {
      $scope.person.phoneNumbers.splice(index, 1);
      return;
    }
    alertService.closeAll();
    alertService.load();
    personService.dropPhoneWithPhoneId({
      id: phone.id
    })
    .then(function () {
      masterPerson.phoneNumbers.splice(index, 1);
      $scope.person.phoneNumbers.splice(index, 1);
      ensurePhoneNumber();
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded();
    });
  };

  $scope.addPhone = addPhone;
  function addPhone () {
    $scope.person.phoneNumbers = $scope.person.phoneNumbers || [];
    $scope.person.phoneNumbers.push({
      number: '',
      type: 'mobile'
    });
  }

  function ensurePhoneNumber () {
    if (!$scope.person.phoneNumbers || !$scope.person.phoneNumbers.length) {
      addPhone();
    }
  }

  $scope.uploadProfileImage = function (file) {
    $scope.profileImageSuccess = false;
    if (!file) { return; }

    alertService.closeAll();
    alertService.load();
    $scope.refreshProfileImage = true;

    personService.setProfileImage({
      person: $scope.person.id,
    }, {
      image: file
    })
    .then(function (person) {
      $scope.profileImageSuccess = true;
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded();
      $scope.refreshProfileImage = false;
    });
  };

});
