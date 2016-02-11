'use strict';

angular.module('owm.discount')

.directive('discountList', function () {
  return {
    restrict: 'E',
    scope: {
      me: '=',
      resource: '=',
    },
    templateUrl: 'discount/discountList.tpl.html',
    controller: 'DiscountListController'
  };
})

.controller('DiscountListController', function ($log, $q, $modal, $mdDialog, $scope, API_DATE_FORMAT, discountService, alertService) {
  $scope.discounts = [];

  function init () {
    if ($scope.resource) {
      $scope.loadDiscounts();
    } else {
      $log.debug('Error: no resource set for discount list');
    }
  }

  $scope.loadDiscounts = function () {
    alertService.load();
    loadDiscounts().finally(alertService.loaded);
  };

  $scope.disableDiscount = function (discount) {
    alertService.load();
    disableDiscount(discount).catch(alertService.addError).finally(alertService.loaded);
  };

  $scope.createDiscount = function ($event) {
    $mdDialog.show({
      autoWrap: false,
      targetEvent: $event,
      templateUrl: 'discount/discountDialog.tpl.html',
      controller : 'DiscountDialogController',
      locals: {
        resource: $scope.resource,
        sender: $scope.me
      }
    })
    .then(function (discount) {
      $log.debug('discount created', discount);
      $scope.loadDiscounts();
    });
  };


  init();


  function loadDiscounts () {
    return discountService.search({
      resource: $scope.resource.id

      // TODO: show discounts valid now
      // validFrom: moment().startOf('day').format(API_DATE_FORMAT),
      // validUntil: moment().startOf('day').add(1, 'days').format(API_DATE_FORMAT)
    })
    .then(function (discounts) {
      $scope.discounts = discounts;
    })
    .catch(function (err) {
      $log.debug('error loading discounts', err);
    });
  }

  function disableDiscount (discount) {
    return discountService.disable({ discount: discount.code }).then(function (response) {
      $log.debug('discount disabled', response);
      return loadDiscounts();
    });
  }

});
