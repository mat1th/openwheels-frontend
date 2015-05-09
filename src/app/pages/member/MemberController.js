'use strict';
angular.module('owm.pages.member',[])

.controller('MemberController', function ($window, $filter, $scope, alertService, authService, personService, chatPopupService, user, member) {

  $scope.user = user;
  $scope.person = member;
  $scope.activeResources = [];
  $scope.showContactInfo = false;
  $scope.showSidebar = false;

  $scope.openChatWith = openChatWith;
  $scope.login = login;

  init();

  function init () {
    $scope.showContactInfo = (
      user.isAuthenticated ||
      member.city ||
      member.email ||
      (member.phoneNumbers && member.phoneNumbers.length) ||
      member.facebookUid ||
      member.twitterUid ||
      member.linkedinUid
    );
    $scope.activeResources = $filter('filter')(member.resources || [], function (resource) {
      return resource.isActive;
    });
    $scope.showSidebar = $scope.showContactInfo || $scope.activeResources.length;
  }

  function login () {
    authService.loginPopup().then(function () {
      alertService.load();
      personService.get({ person: member.id })
      .then(function (member) {
        $scope.person = member;
        init();
      })
      .catch(function (err) {
        alertService.showError(err);
      })
      .finally(function () {
        alertService.loaded();
      });
    });
  }

  function openChatWith (otherPerson) {
    var otherPersonName = $filter('fullname')(otherPerson);
    chatPopupService.openPopup(otherPersonName, otherPerson.id,
      null, // resource id
      null  // booking id
    );
  }

})
;
