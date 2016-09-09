'use strict';

angular.module('owm.chat.controller', [])

.controller('ChatPopupController', function ($timeout, $q, $filter, $scope, chatPopupService, messageService, alertService, popupTitle, me, personId, resourceId, bookingId, Analytics) {

  var INITIAL_MESSAGE_COUNT        = 20;
  var OLDER_MESSAGES_COUNT         = 20;
  var SHOW_REFRESH_BUTTON_AFTER_MS = 15000;
  var AUTO_REFRESH_AFTER_MS        = 60000;

  var autoRefreshTimeout, refreshButtonTimeout;

  $scope.me = me;
  $scope.messages = [];
  $scope.message = '';
  $scope.dismiss = chatPopupService.dismiss;
  $scope.popupTitle = popupTitle;
  $scope.isLoading = false;
  $scope.isAutoRefreshing = false;
  $scope.showRefreshButton = false;
  $scope.showBeforeButton = false;

  getConversation();

  function getConversation () {
    $scope.isLoading = true;

    messageService.getConversationWith({
      person: personId,
      max : INITIAL_MESSAGE_COUNT
    })
    .then(function (messages) {
      $scope.messages = messages && messages.length ? $filter('orderBy')(messages, 'id') : [];
      $scope.lastUpdate = moment();

      if ($scope.messages.length >= INITIAL_MESSAGE_COUNT) {
        $scope.showBeforeButton = true;
      }

      chatPopupService.focusInput();
      $timeout(function () {
        chatPopupService.scrollToBottom();
      }, 500);

      restartRefreshButtonTimeout();
      restartAutoRefreshTimeout();
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      $scope.isLoading = false;
    });
  }

  function getOlderMessages () {
    if (!$scope.messages.length) {
      var dfd = $q.defer();
      dfd.resolve(0);
      return dfd.promise();
    }

    return messageService.getMessagesBefore({
      message: $scope.messages[0].id,
      person: personId,
      max: OLDER_MESSAGES_COUNT
    })
    .then(function (messages) {
      var count = 0;
      if (messages && messages.length) {
        angular.forEach($filter('orderBy')(messages, 'id', true), function (message) {
          $scope.messages.unshift(message);
          count++;
        });
      }
      if (count < OLDER_MESSAGES_COUNT) {
        $scope.showBeforeButton = false;
      }
      return count;
    });
  }

  function getNewerMessages () {
    if (!$scope.messages.length) {
      return getConversation();
    }

    return messageService.getMessagesAfter({
      message: $scope.messages[$scope.messages.length - 1].id,
      person : personId
    })
    .then(function (messages) {
      var count = 0;
      angular.forEach($filter('orderBy')(messages, 'id'), function (message) {
        $scope.messages.push(message);
        count++;
      });
      $scope.lastUpdate = moment();
      return count;
    });
  }

  $scope.sendMessage = function (message) {
    $scope.isLoading = true;
    $scope.showRefreshButton = false;
    $timeout.cancel(autoRefreshTimeout);
    chatPopupService.scrollToBottom();

    var params = {
      recipient: personId,
      text: message
    };
    if (resourceId) { params.resourceId = resourceId; }
    if (bookingId) { params.bookingId = bookingId; }

    messageService.sendMessageTo(params)
    .then(function () {
      Analytics.trackEvent('discovery', 'send_message', resourceId);
      $scope.message = '';
      return getNewerMessages();
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      $scope.isLoading = false;

      chatPopupService.scrollToBottom();
      chatPopupService.focusInput();

      restartRefreshButtonTimeout();
      restartAutoRefreshTimeout();
    });
  };

  $scope.getOlderMessages = function () {
    $scope.isBeforeLoading = true;
    getOlderMessages().finally(function () {
      $scope.isBeforeLoading = false;
    });
  };

  $scope.refresh = function () {
    $scope.isLoading = true;
    $timeout.cancel(autoRefreshTimeout);

    getNewerMessages().then(function (numberOfNewMessages) {
      chatPopupService.scrollToBottom();
    })
    .finally(function () {
      $scope.isLoading = false;

      restartRefreshButtonTimeout();
      restartAutoRefreshTimeout();

      chatPopupService.scrollToBottom();
      chatPopupService.focusInput();
    });
  };

  function restartRefreshButtonTimeout () {
    $timeout.cancel(refreshButtonTimeout);

    $scope.showRefreshButton = false;
    refreshButtonTimeout = $timeout(function () {
      if ($scope.messages.length) {
        $scope.showRefreshButton = true;
      }
    }, SHOW_REFRESH_BUTTON_AFTER_MS);
  }

  function restartAutoRefreshTimeout () {
    $timeout.cancel(autoRefreshTimeout);

    autoRefreshTimeout = $timeout(function () {
      $scope.showRefreshButton = false;
      $scope.isLoading = true;

      getNewerMessages().then(function (numberOfNewMessages) {
        if (numberOfNewMessages > 0) {
          chatPopupService.scrollToBottom();
        }
      }).finally(function () {
        $scope.isLoading = false;
        restartRefreshButtonTimeout();
        restartAutoRefreshTimeout();
      });
    }, AUTO_REFRESH_AFTER_MS);
  }

  $scope.$on('$destroy', function () {
    $timeout.cancel(autoRefreshTimeout);
  });

});
