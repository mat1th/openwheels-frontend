'use strict';

angular.module('oAuth2MessageListener', [])

.service('oAuth2MessageListener', function ($log, $window, $rootScope, tokenService, authService) {

  $window.addEventListener('message', messageHandler);

  function messageHandler (e) {
    var myOrigin = $window.location.protocol + '//' + $window.location.host;
    var message, token;

    if (e.origin !== myOrigin) {
      $log.debug('(ignore postMessage from ' + e.origin);
      return;
    }

    try {
      message = JSON.parse(e.data);
    } catch (e) {
      message = {};
    }

    $log.debug('message received', message);

    if (message.name === 'oAuthToken' && message.data) {
      token = tokenService.createToken(message.data);
      token.save();
      authService.notifyFreshToken(token);
      e.source.close();
    }
    if (message.name === 'oAuthError' && message.data) {
      authService.notifyTokenError();
      e.source.close();
    }
  }

});
