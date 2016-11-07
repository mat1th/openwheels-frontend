'use strict';

angular.module('signupFormDirective', [])

.directive('signupForm', function () {
  return {
    restrict: 'A',
    replace: true,
    transclude: true,
    templateUrl: 'directives/signupFormDirective/signupFormDirective.tpl.html',
    controller: function ($scope, $rootScope, $state, $stateParams, $translate, $q, authService, featuresService, alertService, personService, $mdDialog, Analytics) {
      $scope.auth = {};
      $scope.user = {};
      $scope.me = {};
      $scope.auth.terms = false;
      $scope.closeAlert = alertService.closeAlert;

      var initOptions = function () {
        $scope.preferenceOptions = [{
          label: '',
          value: false
        }, {
          label: $translate.instant('USER_PREFERENCE_RENTER'),
          value: 'renter'
        }, {
          label: $translate.instant('USER_PREFERENCE_OWNER'),
          value: 'owner'
        }, {
          label: $translate.instant('USER_PREFERENCE_BOTH'),
          value: 'both'
        }];
      };

      $scope.$on('$translateChangeSuccess', function () {
        initOptions();
      });
      initOptions();

      if (featuresService.get('hideSignupPreference')) {
        $scope.user.preference = 'both';
      } else {
        if ($state.previous.name === 'owm.resource.own') {
          $scope.user.preference = 'owner';
        } else {
          $scope.user.preference = false;
        }
      }
      $scope.login = function () {
        $scope.cancel();
        authService.loginPopup().then(function () {
          if ($state.current.name === 'home' || $state.current.name === 'owm.auth.signup') {
            $state.go('owm.person.dashboard');
          }
        });
      };

      $scope.signup = function () {
        alertService.load();
        if ($scope.url === 'owm.person.details({pageNumber: \'1\'})') {
          $scope.user.preference = 'renter';
        } else if ($scope.url === 'owm.resource.create.carInfo') {
          $scope.user.preference = 'owner';
        }

        var email = $scope.auth.email,
          password = $scope.auth.password,
          user = $scope.user,
          terms = $scope.auth.terms,
          preference = user.preference;

        if (email && password && user) {
          if (preference) {
            if (terms === true) {
              authService.oauthSubscribe({
                  email: email.trim().toLowerCase(),
                  password: password,
                  other: user
                }).then(function (res) {
                  Analytics.trackEvent('person', 'created', res.id, undefined, true);
                  if ($scope.url === 'owm.person.details({pageNumber: \'1\'})') {
                    var booking = $scope.booking;
                    var resource = $scope.resource;
                    $mdDialog.cancel();
                    $state.go('owm.person.details', { // should fill in the details
                      pageNumber: '1',
                      city: resource.city ? resource.city : 'utrecht',
                      resourceId: resource.id,
                      startDate: booking.beginRequested,
                      endDate: booking.endRequested,
                      discountCode: booking.discountCode,
                      remarkRequester: booking.remarkRequester,
                      riskReduction: booking.riskReduction
                    });
                  } else if ($scope.url === 'owm.resource.create.carInfo') {
                    var licencePlate = $scope.licencePlate;
                    var calculateYourPrice = $scope.calculateYourPrice;
                    $mdDialog.cancel();

                    $state.go('owm.resource.create.carInfo', { // should fill in the details
                      licencePlate: licencePlate.content,
                      dayPrice: calculateYourPrice.dayPrice,
                      numberOfDays: calculateYourPrice.numberOfDays
                    });
                  } else {
                    $state.go($scope.url);
                  }
                })
                .catch(function (err) {
                  alertService.add(err.level, err.message, 4000);
                })
                .finally(function () {
                  alertService.loaded();
                });
            } else {
              alertService.add('danger', $translate.instant('SIGNUP_AGREE_TO_TERMS_ALERT'), 4000);
              alertService.loaded();
            }
          } else {
            alertService.add('danger', $translate.instant('SIGNUP_RENTER_OWNER_CHOICE_ALERT'), 4000);
            alertService.loaded();
          }
        } else {
          alertService.add('danger', $translate.instant('SIGNUP_FILL_IN_FIELDS_ALERT'), 4000);
          alertService.loaded();
        }
      };
    }
  };
});
