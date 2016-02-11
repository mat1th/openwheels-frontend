'use strict';

angular.module('owm.discount')

.controller('DiscountDialogController', function ($log, $mdDialog, $scope, API_DATE_FORMAT, alertService, discountService, resource, sender) {

  $scope.discount = {
    senderId: sender.id,
    resourceId: resource.id
  };

  $scope.cancelDialog = function () {
    $mdDialog.cancel();
  };

  $scope.createDiscount = function () {
    var params = angular.copy($scope.discount);

    params.sender = params.senderId;
    params.recipient = params.recipientId;
    params.resource = params.resourceId;
    params.validFrom = moment(params.validFrom).startOf('day').format(API_DATE_FORMAT);
    params.validUntil = moment(params.validUntil).startOf('day').add(1, 'days').format(API_DATE_FORMAT);

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
