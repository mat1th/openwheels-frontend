'use strict';

angular.module('owm.person.license', [])

.controller('PersonLicenseController', function ($http, $state, authService, personService, alertService, me, $scope) {

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
      $state.go('owm.person.dashboard');
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
