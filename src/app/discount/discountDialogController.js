'use strict';

angular.module('owm.discount')

.controller('DiscountDialogController', function ($q, $timeout, $log, $mdDialog, $scope, API_DATE_FORMAT, alertService, discountService, personService, resource, sender) {

  var validRecipient = $scope.validRecipient = {
    pending: false,
    id: null,
    email: null
  };

  $scope.discount = {
    sender: sender.id,
    resource: resource.id,
    recipientEmail: ''
  };

  $scope.cancelDialog = function () {
    $mdDialog.cancel();
  };

  $scope.resetRecipient = function () {
    validRecipient.id = null;
    validRecipient.email = null;
  };

  $scope.validateRecipient = function () {
    var form = $scope.form;
    var email = $scope.discount.recipientEmail;

    if (!email || form.recipientEmail.$error.email) {
      return;
    }

    if (email === validRecipient.email) {
      return;
    }

    form.$setSubmitted(); // will show ngMessages
    validRecipient.pending = true;

    personService.search({ search: email }).then(function (people) {
      if (!people || !people.length) {
        $log.debug('no persons found');
        return $q.reject();
      }
      if (people.length > 1) {
        $log.debug('multiple matches');
        return $q.reject();
      }
      // valid !
      validRecipient.id = people[0].id;
      validRecipient.email = email;
    })
    .catch(function (err) {
      $log.debug(err);
      validRecipient.id = null;
      validRecipient.email = null;
    })
    .finally(function () {
      form.recipientEmail.$setValidity('registeredEmail', !!validRecipient.id);
      validRecipient.pending = false;
    });
  };

  $scope.createDiscount = function () {
    var params = angular.copy($scope.discount);
    delete params.recipientEmail;

    if (validRecipient.id) {
      params.recipient = validRecipient.id;
    }

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
