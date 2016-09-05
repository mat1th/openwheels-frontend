'use strict';

angular.module('owm.auth.signup', [])

.controller('AuthSignupController', function ($scope, $state, $stateParams, $translate, $q, authService, featuresService, alertService) {

  $scope.url = 'owm.person.dashboard';
});
