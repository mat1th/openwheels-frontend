'use strict';

angular.module('owm.discount')

.directive('discountList', function () {
  return {
    restrict: 'E',
    scope: {
      resource: '='
    },
    templateUrl: 'discount/discountList.tpl.html',
    controller: 'DiscountListController'
  };
})

.controller('DiscountListController', function ($scope, discountService, alertService) {
  $scope.discounts = [];

  init();

  function init () {
    if ($scope.resource) {
      loadDiscountsForResource($scope.resource.id);
    }
  }

  function loadDiscountsForResource (resourceId) {
    alertService.load();
    return discountService.search({ resource: resourceId }).then(function (discounts) {
      $scope.discounts = discounts;
    })
    .finally(alertService.loaded);
  }

})
;
