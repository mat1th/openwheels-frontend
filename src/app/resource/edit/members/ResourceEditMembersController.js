'use strict';

angular.module('owm.resource.edit.members', [])

.controller('ResourceEditMembersController', function ($scope, $q, $translate, $filter, dialogService, alertService, resourceService, personService, chatPopupService) {

  if (!$scope.resource || !$scope.members) { return; }

  var resource = $scope.resource;
  $scope.email = '';

  function reloadMembers () {
    return resourceService.getMembers({
      resource: resource.id
    });
  }

  function findPeopleByEmail (email) {
    return personService.search({
      search: email
    });
  }

  function addMember (personId) {
    return resourceService.addMember({
      resource: resource.id,
      person  : personId
    });
  }

  function removeMember (personId) {
    return resourceService.removeMember({
      resource: resource.id,
      person  : personId
    });
  }

  function invitePersonByEmail (email) {
    return resourceService.invitePerson({
      resource: resource.id,
      email   : email
    });
  }

  function getInviteConfirmation () {
    return dialogService.showModal(null, {
      closeButtonText: $translate.instant('CANCEL_INVITE'),
      actionButtonText: $translate.instant('OK_INVITE'),
      headerText: $translate.instant('INVITE_MEMBER_DIALOG_HEADER'),
      bodyText: $translate.instant('INVITE_MEMBER_DIALOG_BODY')
    });
  }

  $scope.addOrInviteMember = function () {
    var email = $scope.email;

    alertService.load();
    findPeopleByEmail(email).then(function (people) {
      if (people && people.length) {
        return people[0].id;
      }
      else {
        alertService.loaded();
        getInviteConfirmation().then(function () {

          alertService.load();
          invitePersonByEmail(email).then(function (buggyApiResponse) {

            // (Temporary?) workaround for api returning garbage instead of a complete list of current members
            return reloadMembers().then(function (members) {
              $scope.members.length = 0;
              angular.forEach(members, function (member) { $scope.members.push(member); });
              $scope.email = '';
              alertService.add('success', $translate.instant('MEMBER_INVITE_SUCCESS'), 5000);
            });
          })
          .catch(function (err) {
            alertService.addError(err);
          })
          .finally(function () {
            alertService.loaded();
          });
        });

        return null;
      }
    })
    .then(function (personId) {
      if (personId) {
        return addMember(personId).then(function (members) {
          $scope.email = '';
          $scope.members.length = 0;
          angular.forEach(members, function (member) { $scope.members.push(member); });
          alertService.add('success', $translate.instant('MEMBER_ADD_SUCCESS'), 5000);
        });
      }
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded();
    });
  };

  $scope.removeMember = function (personId) {
    if (!personId) { return; }

    alertService.load();
    removeMember(personId).then(function (members) {
      $scope.members.length = 0;
      angular.forEach(members, function (member) { $scope.members.push(member); });
      alertService.add('success', $translate.instant('MEMBER_REMOVE_SUCCESS'), 3000);
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded();
    });
  };

  $scope.openChat = function (member) {
    var otherPersonName = $filter('fullname')(member) || 'lidnummer ' + member.id;
    chatPopupService.openPopup(otherPersonName, member.id, null, null);
  };

});
