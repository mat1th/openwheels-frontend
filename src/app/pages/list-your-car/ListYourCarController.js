'use strict';
angular.module('owm.pages.list-your-car', [])

.controller('ListYourCarController', function ($scope, user) {
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

  $scope.$watchCollection(function () {
    if ($scope.calculateYourPrice) {
      var sum =  5 * $scope.calculateYourPrice.numberOfDays * 12;
      $scope.calculateYourPrice.total = $scope.calculateYourPrice.dayPrice + sum;
    }
  }, true);

});
