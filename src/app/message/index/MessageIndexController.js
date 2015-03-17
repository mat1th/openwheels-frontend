'use strict';

angular.module('owm.message.index', [])

.controller('MessageIndexController', function ($filter, $scope, chatPopupService, me, conversations) {

  $scope.me = me;
  $scope.conversations = conversations;

  $scope.selectConversation = function (conversation) {
    var otherPerson = conversation.sender.id === me.id ? conversation.recipient : conversation.sender;

    chatPopupService.openPopup($filter('fullname')(otherPerson),
      otherPerson.id,
      null, // resourceId
      null  // bookingId
    );
  };

})
;
