'use strict';
angular.module('owm.pages.member',[])

.controller('MemberController', function ($filter, $scope, chatPopupService, user, member) {

  $scope.user = user;
  $scope.person = member;
  $scope.openChatWith = openChatWith;

  function openChatWith (otherPerson) {
    var otherPersonName = $filter('fullname')(otherPerson);
    chatPopupService.openPopup(otherPersonName, otherPerson.id,
      null, // resource id
      null  // booking id
    );
  }

})
;
