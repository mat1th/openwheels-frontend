'use strict';
angular.module('owm.pages.member', [])

.controller('MemberController', function ($window, $filter, $scope, alertService, authService, resourceService,
  personService, chatPopupService, featuresService, ratingService, user, member) {

  $scope.user = user;
  $scope.person = member;
  $scope.activeResources = [];
  $scope.showContactInfo = false;
  $scope.showSidebar = false;

  $scope.openChatWith = openChatWith;
  $scope.login = login;

  /**
   * Init
   */
  initLayout();
  loadResources();
  if (user.isAuthenticated && featuresService.get('ratings')) {
    loadRatings();
  }

  function initLayout() {
    $scope.showContactInfo = (
      user.isAuthenticated ||
      member.city ||
      member.email ||
      (member.phoneNumbers && member.phoneNumbers.length) ||
      member.facebookUid ||
      member.twitterUid ||
      member.linkedinUid
    );
    $scope.showSidebar = $scope.showContactInfo || $scope.activeResources.length;
  }

  /* returns some active resources */
  function loadResources() {
    alertService.load();
    resourceService.search({
        owner: member.id,
        page: 0,
        perPage: 5
      })
      .then(function (resources) {
        $scope.activeResources = $filter('filter')(resources || [], function (resource) {
          return resource.isActive;
        });
      })
      .catch(function () {
        $scope.activeResources = [];
      })
      .finally(function () {
        alertService.loaded();
        initLayout();
      });
  }

  function loadRatings() {
    return ratingService.getDriverRatings({
      driver: $scope.person.id
    }).then(function (result) {
      $scope.person.ratings = result;
    });
  }

  function login() {
    authService.loginPopup().then(function () {
      alertService.load();
      personService.get({
          version: 2,
          person: member.id
        })
        .then(function (member) {
          $scope.person = member;
          initLayout();
        })
        .catch(function (err) {
          alertService.showError(err);
        })
        .finally(function () {
          alertService.loaded();
        });
    });
  }

  function openChatWith(otherPerson) {
    var otherPersonName = $filter('fullname')(otherPerson);
    chatPopupService.openPopup(otherPersonName, otherPerson.id,
      null, // resource id
      null // booking id
    );
  }

});
