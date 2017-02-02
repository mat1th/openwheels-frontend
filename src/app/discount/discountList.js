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

.controller('DiscountListController', function ($log, $q, $uibModal, $mdDialog, $scope, API_DATE_FORMAT, discountService, alertService, Analytics) {
  var ctrl = $scope.ctrl = {};

  ctrl.ranges = {
    now: {},
    custom: {
      start: moment().startOf('day').toDate(),
      end: null
    }
  };

  ctrl.selectedRange = ctrl.ranges.now;

  $scope.discounts = [];

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
      Analytics.trackEvent('resource', 'discount_created', $scope.resource.id, undefined, true);
      $scope.loadDiscounts();
    });
  };

  $scope.discountDetails = function ($event) {
    $mdDialog.show({
      autoWrap: false,
      targetEvent: $event,
      templateUrl: 'discount/discountDetailsDialog.tpl.html',
      controller: 'DiscountDetailsDialogController',
      locals: {
        discount: $event
      }
    });
  };

  init();

  function init () {
    if ($scope.resource) {
      $scope.loadDiscounts();
    } else {
      $log.debug('Error: no resource set for discount list');
    }
  }

  function loadDiscounts () {
    var range = ctrl.selectedRange,
        validFrom,
        validUntil;

    switch (ctrl.selectedRange) {
      case ctrl.ranges.custom:
        validFrom = range.start ? moment(range.start).startOf('day').format(API_DATE_FORMAT) : null;
        validUntil = range.end ? moment(range.end).startOf('day').add(1, 'days').format(API_DATE_FORMAT) : null;
        break;

      case ctrl.ranges.now:
        validFrom = moment().format(API_DATE_FORMAT);
        validUntil = null;
        break;

      default: // shouldn't be possible
        return;
    }

    $log.debug('get discounts valid from', validFrom, 'until', validUntil);

    return discountService.search({
      resource: $scope.resource.id,
      validFrom: validFrom,
      validUntil: validUntil,
      sender: $scope.me.id
    }).then(function (discounts) {
      $scope.discounts = discounts.result;
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
