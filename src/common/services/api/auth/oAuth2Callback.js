'use strict';

angular.module('oAuth2Callback', [])

.config(function ($stateProvider) {

  $stateProvider.state('oauth2callback', {
    url: '/oauth2callback?successPath&errorPath',
    onEnter:  ['$log', '$window', '$location', '$timeout', '$rootScope', '$stateParams', 'authService', 'tokenService', 'appConfig',
      function ($log,   $window,   $location,   $timeout,   $rootScope,   $stateParams,   authService,   tokenService ,  appConfig) {

      var DEFAULT_SUCCESS_PATH = '/';
      var DEFAULT_ERROR_PATH   = '/';

      var successPath = $stateParams.successPath || DEFAULT_SUCCESS_PATH;
      var errorPath   = $stateParams.errorPath   || DEFAULT_ERROR_PATH;
      if (successPath === 'postMessage' && !$window.opener) { successPath = DEFAULT_SUCCESS_PATH; }
      if (errorPath   === 'postMessage' && !$window.opener) { errorPath   = DEFAULT_ERROR_PATH; }

      var req = hashToObject($location.hash());
      if (req.access_token) {
        handleSuccessResponse(req);
      } else {
        handleErrorResponse();
      }

      function handleSuccessResponse (req) {
        $log.debug('<-- received a token at oauth2callback');
        var token;
        var tokenData = {
          accessToken : req.access_token,
          expiresIn   : angular.isNumber(req.expires_in) ? parseInt(req.expires_in) : 0,
          tokenType   : req.token_type,
          refreshToken: req.refresh_token
        };

        if (successPath === 'postMessage') {
          // post access token to parent window
          postMessage({
            name: 'oAuthToken',
            data: tokenData
          });

        } else {
          // authenticate & redirect
          token = tokenService.createToken(tokenData).save();

          $timeout(function () {
            $location.url(successPath);
            $location.replace();
          }, 0);

        }
      }

      function handleErrorResponse () {
        $log.debug('<-! error response at oauth2callback');
        if (errorPath === 'postMessage') {
          postMessage({
            name: 'oAuthError',
            data: 'auth callback did not return a token'
          });
        }
      }

      function postMessage (msgObj) {
        $log.debug('post token message to window.opener');
        var targetOrigin = $window.location.protocol + '//' + $window.location.host;
        $window.opener.postMessage(JSON.stringify(msgObj), targetOrigin);
      }

      function hashToObject (hash) {
        var result = {};
        if (!angular.isString(hash)) {
          return result;
        }
        hash.split('&').forEach(function (pair) {
          var items = pair.split('=');
          result[items[0]] = items[1];
        });
        return result;
      }

    }] // /onEnter

  });

});
