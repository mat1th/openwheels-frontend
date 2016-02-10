'use strict';

angular.module('owm.discount')

.directive('discountForm', function () {
  return {
    restrict: 'E',
    scope: {
      resource: '=',
      sender: '='
    },
    templateUrl: 'discount/discountForm.tpl.html',
    controller: 'DiscountFormController'
  };
})

.controller('DiscountFormController', function ($scope, discountService, alertService) {
  var discount = {};

  $scope.doneSaving = false;
  $scope.discount = discount;

  init();

  function init () {
    if ($scope.sender) {
      discount.sender = $scope.sender.id;
    }
    if ($scope.resource) {
      discount.resource = $scope.resource.id;
    }
  }

  $scope.save = function () {
    var discount = $scope.discount;
    var params = angular.copy(discount);

    /* TODO: move validUntil to start of next day */

    alertService.load();
    discountService.create(discount).then(function (result) {
      alertService.addSaveSuccess();
      console.log(result);
      $scope.doneSaving = true;
    })
    .catch(alertService.addError)
    .finally(alertService.loaded);
  };

})
;
