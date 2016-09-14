'use strict';
angular.module('owm.pages.list-your-car', [])

.controller('listYourCarController', function ($scope, $state, $mdDialog, $log, $mdMedia) {

  $scope.openboxes = {};

  $scope.toggleBox = function (box) {
    if (!$scope.openboxes[box]) {
      $scope.openboxes[box] = true;
    } else {
      $scope.openboxes[box] = !$scope.openboxes[box];
    }
  };

  $scope.licencePlate = {
    content: '',
    data: false,
    showError: false,
    error: ''
  };
  $scope.calculateYourPrice = {
    total: 265,
    dayPrice: 25,
    numberOfDays: 4
  };

  //watch on changes on the form
  $scope.$watchCollection(function () {
    if ($scope.calculateYourPrice) {
      return $scope.calculateYourPrice;
    }
  }, function () {
    if ($scope.calculateYourPrice) {
      var sum = $scope.calculateYourPrice.numberOfDays * 12;
      $scope.calculateYourPrice.total = ($scope.calculateYourPrice.dayPrice + 5) * sum;
    }
  }, true);

  //the four buttons to add add an remove the number of days and dayPrice
  $scope.changePrice = function (e, change, elm, max) {
    if (change === '-') {
      if ($scope.calculateYourPrice[elm] > 0) {
        $scope.calculateYourPrice[elm]--;
      }
    } else if (change === '+') {
      if ($scope.calculateYourPrice[elm] < max) {
        $scope.calculateYourPrice[elm]++;
      }
    }
  };

  $scope.beginRentingOut = function () {
    if ($scope.user.identity !== undefined && $scope.user.identity !== null) {
      $state.go('owm.resource.create.carInfo', { // should fill in the details
        licencePlate: $scope.licencePlate.content,
        dayPrice: $scope.calculateYourPrice.dayPrice,
        numberOfDays: $scope.calculateYourPrice.numberOfDays,
        personSubmitted: false
      });
    } else {
      $mdDialog.show({
        clickOutsideToClose: true,
        locals: {
          licencePlate: $scope.licencePlate,
          calculateYourPrice: $scope.calculateYourPrice
        },
        fullscreen: $mdMedia('xs'),
        templateUrl: 'pages/list-your-car/list-your-car-dialog.tpl.html',
        controller: ['$scope', '$mdDialog', 'authService', 'calculateYourPrice', 'licencePlate', function ($scope, $mdDialog, authService, calculateYourPrice, licencePlate) {
          $scope.url = 'owm.resource.create.carInfo';
          $scope.calculateYourPrice = calculateYourPrice;
          $scope.licencePlate = licencePlate;
          $scope.hide = function () {
            $mdDialog.hide();
          };
          $scope.cancel = function () {
            $mdDialog.cancel();
          };
          $scope.answer = function (answer) {
            $mdDialog.hide(answer);
          };
        }]
      });
    }
  };

});
