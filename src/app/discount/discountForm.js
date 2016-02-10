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

.controller('DiscountFormController', function ($log, API_DATE_FORMAT, $scope, discountService, alertService) {
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
    var params = angular.copy($scope.discount);

    params.validFrom = moment(params.validFrom).startOf('day').format(API_DATE_FORMAT);
    params.validUntil = moment(params.validUntil).startOf('day').add(1, 'days').format(API_DATE_FORMAT);

    alertService.load();

    discountService.create(params).then(function (discount) {
      $log.debug('Discount created:', discount);
      alertService.addSaveSuccess();
      $scope.doneSaving = true;
    })
    .catch(alertService.addError)
    .finally(alertService.loaded);
  };

})
;
