'use strict';

angular.module('owm.alert', [])

.controller('MyAlertController', function ($scope, alertService) {
  $scope.closeAlert = alertService.closeAlert;
})

;
