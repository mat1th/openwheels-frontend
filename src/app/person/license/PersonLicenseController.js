'use strict';

angular.module('owm.person.license', [])

.controller('PersonLicenseController', function ($log, $http, $state, authService, personService, alertService, me, $scope) {

  var images = {
    front: null
  };

  $scope.images = images;
  $scope.isBusy = false;

  angular.element('#licenseFrontFile').on('change', function (e) {
    $scope.$apply(function () {
      images.front = e.target.files[0];
    });
  });

  $scope.startUpload = function () {
    if (!images.front) { return; }

    $scope.isBusy = true;
    alertService.load();

    personService.addLicenseImages({
      person: me.id
    }, {
      frontImage: images.front
    })
    .then(function () {
      alertService.add('success', 'Bedankt voor het uploaden van je rijbewijs', 5000);

      // reload user info (status may have changed as a result of uploading license)
      personService.me({ version: 2 }).then(function (person) {
        angular.extend(authService.user.identity, person);
      })
     // silently fail
      .catch(function (err) {
        $log.debug('error', err);
      })
      .finally(function () {
        $state.go('owm.person.dashboard');
      });

    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded();
      $scope.isBusy = false;
    });
  };

})
;
