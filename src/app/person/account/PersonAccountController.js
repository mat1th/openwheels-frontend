'use strict';

angular.module('owm.person.account', [])

.controller('PersonAccountController', function ($scope, authService, accountService, alertService) {

  var person = authService.user.identity;

  $scope.account = null;
  $scope.save = saveAccount;
  $scope.isAccountLoading = false;
  $scope.isAccountLoaded = false;
  $scope.isAccountSaving = false;
  $scope.isAccountSaved = false;
  $scope.isIbanBlocked = false;

  loadAccount();

  function loadAccount () {
    $scope.isAccountLoading = true;
    accountService.get({ person: person.id }).then(function (account) {
      $scope.account = account;
      $scope.isAccountLoaded = true;
      $scope.isIbanBlocked = !!account.iban;
    })
    .finally(function () {
      $scope.isAccountLoading = false;
    });
  }

  function saveAccount (account) {
    var newProps = {};
    newProps.iban = account.iban;

    alertService.closeAll();
    $scope.isAccountSaving = true;
    $scope.isAccountSaved = false;

    accountService.alter({ id: account.id, newProps: newProps }).then(function (result) {
      $scope.isAccountSaved = true;
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      $scope.isAccountSaving = false;
    });
  }

})
;
