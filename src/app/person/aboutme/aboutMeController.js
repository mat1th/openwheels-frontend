'use strict';

angular.module('owm.person.aboutme', [])


.controller('aboutMeController', function ($scope, $translate, $filter, alertService, personService, person) {

  var masterPerson = null;
  initPerson(person);

  function initPerson(person) {
    masterPerson = person;
    $scope.person = angular.copy(person);
  }
  $scope.$watch(function () {
    return $translate.use();
  }, function (lang) {
    if (lang) {
      $scope.visibilityOptions = [{
        label: $translate.instant('PROFILE_VISIBILITY_PUBLIC'),
        value: 'public'
      }, {
        label: $translate.instant('PROFILE_VISIBILITY_RENTALRELATIONS'),
        value: 'rentalrelation_only'
      }, {
        label: $translate.instant('PROFILE_VISIBILITY_MEMBERS'),
        value: 'members'
      }];
    }
  });
  $scope.submitAboutMeForm = function () {
    alertService.closeAll();
    alertService.load();
    var newProps = $filter('returnDirtyItems')(angular.copy($scope.person), $scope.aboutMeForm);
    personService.alter({
        id: person.id,
        newProps: newProps
      })
      .then(function (buggyPersonWithoutPhoneNumbers) {
        alertService.addSaveSuccess();
        initPerson($scope.person);
      })
      .catch(function (err) {
        alertService.addError(err);
      })
      .finally(function () {
        alertService.loaded();
      });
  };
  $scope.profileFileName = 'selecteer een profielfoto';
  angular.element('#ProfileImage').on('change', function (e) {
    uploadProfileImage(e.target.files[0]);
    $scope.$apply(function () {
      $scope.profileFileName = e.target.files[0].name;
    });
  });
  var uploadProfileImage = function (file) {
    console.log(file);
    $scope.profileImageSuccess = false;
    if (!file) {
      return;
    }

    alertService.closeAll();
    alertService.load();
    $scope.refreshProfileImage = true;

    personService.setProfileImage({
        person: $scope.person.id,
      }, {
        image: file
      })
      .then(function (person) {
        $scope.profileImageSuccess = true;
      })
      .catch(function (err) {
        alertService.addError(err);
      })
      .finally(function () {
        alertService.loaded();
        $scope.refreshProfileImage = false;
      });
  };
});
