'use strict';

angular.module('owm.person')

.controller('PersonChipcardsController', function ($log, $window, $state, $uibModal, $scope, chipcards) {

  $scope.chipcards = chipcards;

  $scope.blockChipcard = function (chipcard) {

    $uibModal.open({
      templateUrl: 'person/chipcard/block-modal/person-chipcard-block-modal.tpl.html',
      controller : 'PersonChipcardBlockController',
      resolve: {
        chipcard: function () {
          return chipcard;
        }
      }
    }).result.then(function (result) {
      // on success, remove from list
      angular.forEach($scope.chipcards, function (chipcard, index) {
        if (chipcard.mifareUid === result.mifareUid) {
          $scope.chipcards.splice(index, 1);
        }
      });
    });
  };

  $scope.editChipcard = function (chipcard) {
    $uibModal.open({
      templateUrl: 'person/chipcard/edit-modal/person-chipcard-edit-modal.tpl.html',
      controller : 'PersonChipcardEditController',
      resolve: {
        chipcard: function () {
          return chipcard;
        }
      }
    });
  };
});
