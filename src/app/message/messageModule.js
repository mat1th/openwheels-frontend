'use strict';

angular.module('owm.message', [
  'owm.message.index'
])

.config(function config($stateProvider) {

  $stateProvider

  .state('owm.message', {
    url: '/messages',
    views: {
      'main@': {
        templateUrl: 'message/index/messageIndex.tpl.html',
        controller: 'MessageIndexController'
      }
    },
    data: {
      access: { deny: { anonymous: true } }
    },
    resolve: {
      me: ['authService', function (authService) {
        return authService.me();
      }],
      conversations: ['messageService', function (messageService) {
        return messageService.getMyConversations();
      }]
    }
  });

});


