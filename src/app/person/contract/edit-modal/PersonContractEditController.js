'use strict';
angular.module('owm.person')

.controller('PersonContractEditController', function ($timeout, $log, $modalInstance, dialogService, $translate, $scope, alertService, contractService, contract) {

  var originalContract = contract;
  $scope.contract = angular.copy(originalContract);
  $scope.busy = false;

  function saveContract (newProps) {
    $scope.busy = true;
    contractService.alter({
      id : $scope.contract.id,
      newProps: newProps
    })
    .then(function (newContract) {
      alertService.addSaveSuccess();
      angular.extend(contract, newContract);
      $modalInstance.close();
      $scope.busy = false;
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      $scope.busy = false;
    });
  }

  function endContract () {
    $scope.busy = true;
    contractService.alter({
      id: $scope.contract.id,
      newProps: {
        status: 'blocked'
      }
    })
    .then(function (newContract) {
      alertService.addSaveSuccess();
      angular.extend(contract, newContract);
      $modalInstance.close();
      $scope.busy = false;
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      $scope.busy = false;
    });
  }

  $scope.save = function () {
    var newProps = {};
    if ($scope.contract.ownRiskWaiver !== originalContract.ownRiskWaiver) {
      newProps.ownRiskWaiver = $scope.contract.ownRiskWaiver;
    }
    if (Object.keys(newProps).length) {
      saveContract(newProps);
    }
  };

  $scope.endContract = function (contract) {
    dialogService.showModal(null, {
      closeButtonText: $translate.instant('CANCEL'),
      actionButtonText: $translate.instant('CONFIRM'),
      headerText: $translate.instant('CONTRACT_END_ACTION'),
      bodyText: $translate.instant('CONTRACT_END_CONFIRM_DESC')
    }).then(function () {
      endContract();
    });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss();
  };

})
;
