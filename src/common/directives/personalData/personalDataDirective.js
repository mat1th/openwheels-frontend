'use strict';

angular.module('personalDataDirective', [])

.directive('personalData', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      next: '&',
      resource: '=resource'
    },
    templateUrl: 'directives/personalData/personalData.tpl.html',
    controller: function ($scope, $rootScope, $log, $state, $location, $stateParams, $filter, personService, resourceService, $anchorScroll, $timeout, alertService, account2Service, accountService, dutchZipcodeService, Analytics) {
      //person info
      var masterPerson = null;
      var that;
      //set all vars
      $scope.person = null;
      $scope.genderText = '';
      $scope.person = null;
      $scope.submitPersonalDataForm = null;
      $scope.ownerflow = false;
      $rootScope.personSubmitted = false;
      $scope.ibanIsDefined = true;
      $scope.personSubmitted = $stateParams.personSubmitted === 'true' ? true : false;

      $timeout(function () {
        $scope.personalDataForm.$setPristine();
      }, 0);
      var personPage = {
        init: function () {
          $scope.submitPersonalDataForm = personPage.submitDataForm;
          $scope.ownerflow = $state.current.name === 'owm.resource.create.details' ? true : false;
          this.initPerson();
          that = this;
        },
        submitDataForm: function () {
          var _this = this;
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

          // first check if all person data is filled in
          if (firstName && surname) {
            if (year && month && day) {
              if (phoneNumbers[0].number) {
                if (streetNumber && zipcode && city) {
                  // save persons info
                  personService.alter({
                    person: $scope.person.id,
                    newProps: newProps
                  }).then(function () {
                    
                    Analytics.trackEvent('person', 'edited', $scope.person.id, undefined, true);
                    that.initPerson($scope.person);
                    // if person is renter, send to next page
                    $scope.next();
                    // if person is owner, save IBAN if no IBAN is defined
                    if ($state.current.name === 'owm.resource.create.details' && !$scope.ibanIsDefined) {
                      if($scope.account.iban) {
                        accountService.alter({
                          'id': $scope.account.id,
                          'newProps': {
                            'iban': $scope.account.iban
                          }
                        }).then(function(){
                          // make resource availble if IBAN is saved successfully
                          makeResourceAvailable();
                        }).catch(function (err) {
                          alertService.addError(err);
                        })
                        .finally(function () {
                          alertService.loaded();
                        });
                      } else {
                        alertService.add('danger', 'Vul je IBAN-nummer in zodat we verhuuropbrengst kunnen uitbetalen.', 5000);
                        alertService.loaded();
                      }
                    // if person is owner and IBAN is already defined, make resource available
                    } else if ($state.current.name === 'owm.resource.create.details') {
                      makeResourceAvailable();
                    }
                  }).catch(function (err) {
                    alertService.addError(err);
                  })
                  .finally(function () {
                    alertService.loaded();
                  });
                } else {
                  alertService.add('danger', 'Vul je postcode en huisnummer in zodat we je post kunnen sturen.', 5000);
                  alertService.loaded();
                }
              } else {
                alertService.add('danger', 'Vul je telefoonnummmer in zodat we je kunnen bellen.', 5000);
                alertService.loaded();
              }
            } else {
              alertService.add('danger', 'Vul je geboortedatum in zodat we weten of je auto mag rijden.', 5000);
              alertService.loaded();
            }
          } else {
            alertService.add('danger', 'Vul je voor- en achternaam in zodat we weten hoe we je mogen aanspreken.', 5000);
            alertService.loaded();
          }

          var makeResourceAvailable = function () {
            // make resource available for renters
            resourceService.alter({
              'resource': $scope.resource.id,
              'newProps': {
                'isAvailableOthers': true,
                'isAvailableFriends': true
              }
            }).then(function(){
              // send owner to next page
              $log.debug($rootScope.personSubmitted);
              $rootScope.personSubmitted = true;
              $anchorScroll('scroll-to-top-anchor');
              // add parameter to url
              $location.search('personSubmitted', 'true');
            }).catch(function (err) {
              alertService.addError(err);
            })
            .finally(function () {
              alertService.loaded();
            });
          };

        },
        initAccount: function (person) {
          if ($state.current.name === 'owm.resource.create.details') {
            alertService.load();
            accountService.get({
              'person': person.id
            }).then(function (value) {
              if (!value.iban) {
                $scope.account = value;
                $scope.ibanIsDefined = false;
              } else {
                $scope.ibanIsDefined = true;
              }

              alertService.loaded();
            }).catch(function (err) {
              alertService.addError(err);
            });
          }
        },
        initPerson: function () {
          var _this = this;
          personService.me({
            version: 2
          }).then(function (person) {
            masterPerson = person;
            _this.initAccount(person);
            $scope.person = angular.copy(person);
            // certain fields may only be edited if driver license is not yet checked by the office (see template)
            $scope.allowLicenseRelated = (person.driverLicenseStatus !== 'ok');

            // always show at least one phone number field
            phoneNumber.ensure();

            // Gender dropdown is bound to $scope.genderText instead of person.male
            // Binding to person.male doesn't work, because ng-options doesn't differentiate between false and null
            $scope.genderText = (person.male === true ? 'male' : (person.male === false ? 'female' : ''));

            $scope.date = {
              day: Number(moment($scope.person.dateOfBirth).format('DD')),
              month: Number(moment($scope.person.dateOfBirth).format('MM')),
              year: Number(moment($scope.person.dateOfBirth).format('YYYY'))
            };
          });
        }
      };

      var phoneNumber = {
        ensure: function () {
          if (!$scope.person.phoneNumbers || !$scope.person.phoneNumbers.length) {
            phoneNumber.add();
          }
        },
        add: function () {
          $scope.person.phoneNumbers = $scope.person.phoneNumbers || [];
          $scope.person.phoneNumbers.push({
            number: '',
            type: 'mobile'
          });
        }
      };
      var inputs = {
        init: function () {
          this.autoDate();
          this.adress();
        },
        autoDate: function () { //date input field
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
        },
        adress: function () {
          var _this = this;
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
                  zipcode: _this.stripWhitespace(newValue[0]),
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
        },
        stripWhitespace: function (str) { //remove all spaces
          var out = str;
          while (out.indexOf(' ') >= 0) {
            out = out.replace(' ', '');
          }
          return out;
        }
      };
      personPage.init();
      inputs.init();

    }
  };
});
