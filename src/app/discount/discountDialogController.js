'use strict';

angular.module('owm.discount')

.controller('DiscountDialogController', function ($log, $mdDialog, $scope, API_DATE_FORMAT, alertService, discountService, resource, sender) {

  $scope.discount = {
    sender: sender.id,
    resource: resource.id
  };

  $scope.cancelDialog = function () {
    $mdDialog.cancel();
  };

  $scope.createDiscount = function () {
    var params = angular.copy($scope.discount);

    if (params.validFrom) {
      params.validFrom = moment(params.validFrom).startOf('day').format(API_DATE_FORMAT); // start of selected day
    }

    if (params.validUntil) {
      params.validUntil = moment(params.validUntil).startOf('day').add(1, 'days').format(API_DATE_FORMAT); // end of selected day
    }

    alertService.load();

    discountService.create(params).then(function (discount) {
      $log.debug('Discount created:', discount);
      alertService.addSaveSuccess();
      $mdDialog.hide(discount);
    })
    .catch(alertService.addError)
    .finally(alertService.loaded);
  };

});
