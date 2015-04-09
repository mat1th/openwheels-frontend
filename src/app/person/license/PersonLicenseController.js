'use strict';

angular.module('owm.person.license', [])

.controller('PersonLicenseController', function ($http, $state, authService, personService, alertService, me, $scope) {

  var images = {
    front: null,
    back : null
  };

  $scope.images = images;
  $scope.isBusy = false;

  angular.element('#licenseFrontFile').on('change', function (e) {
    $scope.$apply(function () {
      images.front = e.target.files[0];
    });
  });

  angular.element('#licenseBackFile').on('change', function (e) {
    $scope.$apply(function () {
      images.back = e.target.files[0];
    });
  });

  $scope.startUpload = function () {
    if (!(images.front || images.back)) { return; }

    $scope.isBusy = true;
    alertService.load();

    var multiPartParams = {};
    if (images.front) { multiPartParams.frontImage = images.front; }
    if (images.back)  { multiPartParams.backImage  = images.back; }

    personService.addLicenseImages({
      person: me.id
    }, multiPartParams)
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
