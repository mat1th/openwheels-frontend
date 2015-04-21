'use strict';
angular.module('owm.person')
.controller('PersonContractIndexController', function ($q, $filter, $modal, $translate, $scope, authService, dialogService, alertService, personService, contractService, me) {

  $scope.isLoadingContracts = true;
  loadContracts().finally(function () {
    $scope.isLoadingContracts = false;
  });

  function loadContracts () {
    alertService.load();
    var ownContractsPromise   = contractService.forContractor({ person: me.id });
    var otherContractsPromise = contractService.forDriver({ person: me.id });

    return $q.all([ownContractsPromise, otherContractsPromise])
    .then(function (result) {
      $scope.ownContracts   = result[0];
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

  $scope.getOwnRiskWaiverDescription = function (waiver) {
    switch (waiver.toLowerCase()) {
      case 'not':
        return '';
      default:
        return $translate.instant('CONTRACT.PROP.OWNRISKWAIVER') +
        ': ' + $translate.instant('CONTRACT.PROP.OWNRISKWAIVER.BOOKING');
    }
  };

  $scope.editContract = function (contract) {
    $modal.open({
      templateUrl: 'person/contract/edit-modal/person-contract-edit-modal.tpl.html',
      controller : 'PersonContractEditController',
      resolve: {
        contract: function () {
          return contract;
        }
      }
    }).result.then(function () {
      authService.invalidateMe();
      $scope.ownContracts = $filter('filter')($scope.ownContracts, { status: 'active' });
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
