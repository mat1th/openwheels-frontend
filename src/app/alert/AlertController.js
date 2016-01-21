'use strict';

angular.module('owm.alert', [])

.controller('AlertController', function ($scope, alertService) {
  $scope.closeAlert = alertService.closeAlert;
})

;
