'use strict';

angular.module('signupFormDirective', [])

.directive('signupForm', function () {
  return {
    restrict: 'A',
    replace: true,
    transclude: true,
    templateUrl: 'directives/signupFormDirective/signupFormDirective.tpl.html',
    controller: function ($scope, $rootScope, $state, $stateParams, $translate, $q, authService, featuresService, alertService, personService, $mdDialog) {
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
        if ($state.previous.name === 'owm.resource.create') {
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
                }).then(function () {
                  if ($scope.url === 'owm.person.details({pageNumber: \'1\'})') {
                    var booking = $scope.booking;
                    var resource = $scope.resource;
                    $mdDialog.cancel();
                    $state.go('owm.person.details', { // should register
                      pageNumber: '1',
                      city: resource.city ? resource.city : 'utrecht',
                      resourceId: resource.id,
                      startDate: booking.beginRequested,
                      endDate: booking.endRequested,
                      discountCode: booking.discountCode,
                      remarkRequester: booking.remarkRequester,
                      riskReduction: booking.riskReduction
                    });
                  } else {
                    $state.go($scope.url);
                  }

                })
                .catch(function (err) {
                  alertService.add(err.level, err.message, 5000);
                })
                .finally(function () {
                  alertService.loaded();
                });
            } else {
              alertService.add('danger', 'Voordat je je kan aanmelden, moet je de voorwaarden accepteren.', 10000);
              alertService.loaded();
            }
          } else {
            alertService.add('danger', 'Kies huren of verhuren.', 10000);
            alertService.loaded();
          }
        } else {
          alertService.add('danger', 'Vul alle velden in.', 10000);
          alertService.loaded();
        }
      };
    }
  };
});
