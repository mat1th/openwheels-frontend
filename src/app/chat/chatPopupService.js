'use strict';

angular.module('owm.chat.service', [])

.factory('chatPopupService', function ($log, $modal, $timeout, authService) {

  var modalInstance;

  function openPopup (otherPersonName, otherPersonId, resourceId, bookingId) {
    if (!authService.user.isAuthenticated) {
      $log.debug('Login is required for chatting');
      return;
    }
    modalInstance = $modal.open({
      templateUrl: 'chat/chatPopup.tpl.html',
      controller : 'ChatPopupController',
      windowClass: 'modal-chat',
      resolve: {
        popupTitle: function () { return 'Gesprek met ' + otherPersonName; },
        me        : function () { return authService.user.identity; },
        personId  : function () { return otherPersonId; },
        resourceId: function () { return resourceId; },
        bookingId : function () { return bookingId; }
      }
    });
  }

  function dismiss () {
    modalInstance.dismiss();
  }

  function scrollToBottom () {
    $timeout(function () {
      var measureElm = angular.element('.modal-chat .chat-height-measure');
      var scrollContainer = angular.element('.modal-chat .chat-content');
      scrollContainer.scrollTop(measureElm.height());
    }, 0);
  }

  function focusInput () {
    $timeout(function () {
      angular.element('.modal-chat .chat-input').focus();
    }, 0);
  }

  return {
    openPopup: openPopup,
    dismiss: dismiss,
    scrollToBottom: scrollToBottom,
    focusInput: focusInput
  };

})
;
