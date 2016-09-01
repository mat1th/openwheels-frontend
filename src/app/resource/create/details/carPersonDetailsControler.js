'use strict';

angular.module('owm.resource.create.details', [])

.controller('carPersonDetailsControler', function ($scope, $filter, $state, $log, $q, $stateParams, $translate, resources, resourceService, authService, alertService, dialogService, me) {
  var resource = $scope.resource;
  $scope.personSubmitted = $stateParams.personSubmitted === 'true' ? true : false;
});
