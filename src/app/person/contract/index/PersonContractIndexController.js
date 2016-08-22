'use strict';
angular.module('owm.person')

.controller('PersonContractIndexController', function ($q, $filter, $uibModal, $translate, $scope,
  authService, dialogService, alertService, personService, contractService, me) {

  $scope.busy = false;
  $scope.isLoadingContracts = true;
  $scope.ownContracts = [];
  $scope.ownContractsCopy = [];
  $scope.otherContracts = [];

  loadContracts().finally(function () {
    $scope.isLoadingContracts = false;
  });

  function loadContracts () {
    var ownContractsPromise = contractService.forContractor({ person: me.id });
    var otherContractsPromise = contractService.forDriver({ person: me.id });

    alertService.load();
    return $q.all([ownContractsPromise, otherContractsPromise])
    .then(function (result) {
      $scope.ownContracts = result[0];
      $scope.ownContractsCopy = angular.copy(result[0]);
      $scope.otherContracts = $filter('filter')(result[1], function (c) {
        return c.contractor.id !== me.id;
      });
      $scope.isLoadingContracts = false;
    })
    .finally(function () {
      alertService.loaded();
    });
  }

  $scope.getContractPersons = function (contract) {
    return $filter('filter')(contract.persons, function (person) {
      return person.id !== me.id;
    });
  };

  $scope.saveContract = function ($index, form) {
    var original = $scope.ownContractsCopy[$index];
    var contract = $scope.ownContracts[$index];
    var newProps = {};
    if (contract.ownRiskWaiver !== original.ownRiskWaiver) {
      newProps.ownRiskWaiver = contract.ownRiskWaiver;
    }
    if (Object.keys(newProps).length <= 0) {
      return;
    }

    $scope.busy = true;
    contractService.alter({
      id : contract.id,
      newProps: newProps
    })
    .then(function (saved) {
      alertService.addSaveSuccess();
      angular.extend(original, saved);
      angular.extend(contract, saved);
      form.$setPristine();
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      $scope.busy = false;
    });
  };

  $scope.blockContract = function ($index) {
    var original = $scope.ownContractsCopy[$index];
    var contract = $scope.ownContracts[$index];

    dialogService.showModal(null, {
      closeButtonText: $translate.instant('CANCEL'),
      actionButtonText: $translate.instant('CONFIRM'),
      headerText: $translate.instant('CONTRACT_END_ACTION'),
      bodyText: $translate.instant('CONTRACT_END_CONFIRM_DESC')
    })
    .then(function () {
      $scope.busy = true;
      contractService.alter({
        id: contract.id,
        newProps: {
          status: 'blocked'
        }
      })
      .then(function (saved) {
        alertService.addSaveSuccess();
        angular.extend(contract, saved);
        angular.extend(original, saved);
        $scope.ownContracts = $filter('filter')($scope.ownContracts, { status: 'active' });
        $scope.ownContractsCopy = angular.copy($scope.ownContracts);
      })
      .catch(function (err) {
        alertService.addError(err);
      })
      .finally(function () {
        $scope.busy = false;
      });
    });
  };

  function findSinglePerson (email) {
    return personService.search({
      search: email
    }).then(function(results) {
      if (results && results.length) {
        // HACK: put email address (missing in api response)
        results[0].email = email;
        return results[0];
      } else {
        return $q.reject();
      }
    });
  }

  $scope.addPerson = function (index) {
    var contract = $scope.ownContracts[index];
    var email = contract.emailToAdd;

    alertService.load();
    findSinglePerson(email).then(function (person) {
      contractService.addPerson({
        id: contract.id,
        person: person.id
      })
      .then(function () {
        contract.persons.push(person);
        contract.emailToAdd = null;
      })
      .catch(function (err) {
        alertService.addError(err);
      })
      .finally(function () {
        alertService.loaded();
      });
    })
    .catch(function () {
      alertService.loaded();
      invite(contract, email);
    })
    ;
  };

  $scope.removePerson = function (contract, person) {
    var contractId = contract.id;
    var personId = person.id;

    dialogService.showModal(null, {
      closeButtonText: 'Annuleren',
      actionButtonText: 'Akkoord',
      headerText: 'Persoon van contract verwijderen',
      bodyText: 'Weet je zeker dat je deze persoon van je contract wilt verwijderen?'
    }).then(function (result) {
      alertService.load();
      contractService.removePerson({
        id    : contractId,
        person: personId
      })
      .then(function () {
        // on success, remove from list
        angular.forEach(contract.persons, function (person, index) {
          if (person.id === personId) {
            contract.persons.splice(index, 1);
          }
        });
      })
      .finally(function () {
        alertService.loaded();
      });
    });
  };

  function invite (contract, email) {
    alertService.load();
    contractService.invitePerson({
      contract: contract.id,
      email   : email
    })
    .then(function () {
      alertService.loaded();
      loadContracts();
      alertService.add('success', 'Er is een uitnodiging verstuurd aan ' + email, 5000);
    })
    .catch(function (err) {
      alertService.loaded();
      alertService.addError(err);
    });
  }

});
