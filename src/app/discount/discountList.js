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

.controller('DiscountListController', function ($log, API_DATE_FORMAT, $scope, discountService, alertService) {
  $scope.discounts = [];

  init();

  function init () {
    if ($scope.resource) {
      loadDiscounts();
    }
  }

  function loadDiscounts () {
    alertService.load();
    return discountService.search({
      resource: $scope.resource.id

      // TODO:
      //
      // validFrom: moment().startOf('day').format(API_DATE_FORMAT),
      // validUntil: moment().startOf('day').format(API_DATE_FORMAT)
    })
    .then(function (discounts) {
      $scope.discounts = discounts;
    })
    .catch(function (err) {
      $log.debug('error loading discounts', err);
    })
    .finally(alertService.loaded);
  }

})
;
