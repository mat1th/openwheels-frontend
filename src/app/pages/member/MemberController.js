'use strict';
angular.module('owm.pages.member',[])

.controller('MemberController', function ($filter, $scope, chatPopupService, user, member) {

  $scope.user = user;
  $scope.person = member;
  $scope.openChatWith = openChatWith;

  $scope.showContactInfo = (
    user.isAuthenticated,
    member.city ||
    member.email ||
    (member.phoneNumbers && member.phoneNumbers.length) ||
    member.facebookUid ||
    member.twitterUid ||
    member.linkedinUid
  );

  $scope.showSidebar = $scope.showContactInfo || (member.resources && member.resources.length);

  function openChatWith (otherPerson) {
    var otherPersonName = $filter('fullname')(otherPerson);
    chatPopupService.openPopup(otherPersonName, otherPerson.id,
      null, // resource id
      null  // booking id
    );
  }

})
;
