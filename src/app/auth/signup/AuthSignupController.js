'use strict';

angular.module('owm.auth.signup', [])

  .controller('AuthSignupController', function ($scope, $state, $stateParams, $translate, $q, authService, featuresService, alertService) {
    $scope.auth = {};
    $scope.user = {};
    $scope.me = {};
    $scope.auth.terms = false;
    $scope.closeAlert = alertService.closeAlert;

    var initOptions = function () {
      $scope.preferenceOptions = [
        {label: '', value: false},
        {label: $translate.instant('USER_PREFERENCE_RENTER'), value: 'renter'},
        {label: $translate.instant('USER_PREFERENCE_OWNER'),  value: 'owner'},
        {label: $translate.instant('USER_PREFERENCE_BOTH'),   value: 'both'}
      ];
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

    $scope.signup = function () {
      alertService.load();
      var email = $scope.auth.email,
          password = $scope.auth.password,
          user = $scope.user,
          terms = $scope.auth.terms,
          preference = user.preference;

      if(email && password && user){
        if(preference){
          if (terms === true) {
            authService.oauthSubscribe({
              email: email.trim().toLowerCase(),
              password: password,
              other: user
            }).then(function () {
              $state.go('owm.person.dashboard');
            })
            .catch(function (err) {
              alertService.add(err.level, err.message, 5000);
            })
            .finally(function () {
              alertService.loaded();
            });
          } else {
            alertService.add('danger', 'Voordat je je kan aanmelden, moet je de voorwaarden accepteeren.', 10000);
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
  });
