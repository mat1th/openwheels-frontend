'use strict';

angular.module('owm.person.anwbId', [])

.controller('PersonAnwbIdController', function ($translate, $state, alertService, anwbService, me, $scope) {

  $scope.anwbId = '';
  $scope.isBusy = false;
  $scope.showForm = true;

  angular.forEach(me.badges, function (badge) {
    if (badge.name === 'ANWB-lid') { // Unfortunately the only way at the moment...
      $scope.showForm = false;
    }
  });

  $scope.submit = function () {
    $scope.isBusy = true;
    alertService.closeAll();
    alertService.load();

    anwbService.setAnwbNumber({
      person    : me.id,
      anwbNumber: $scope.anwbId
    })
    .then(function () {
      alertService.add('success', $translate.instant('ANWBID.SAVE_SUCCESS'), 5000);
      $state.go('owm.person.dashboard');
    })
    .catch(function (err) {
      if (err && err.level && err.message) {
        alertService.add(err.level, err.message, 5000);
      } else {
        alertService.addGenericError();
      }
    })
    .finally(function () {
      $scope.isBusy = false;
      alertService.loaded();
    });
  };

})
;
