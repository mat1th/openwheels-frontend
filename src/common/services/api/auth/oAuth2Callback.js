'use strict';

angular.module('oAuth2Callback', [])

.config(function ($stateProvider) {

  $stateProvider.state('oauth2callback', {
    url: '/oauth2callback?successPath&errorPath&access_token&expires_in&token_type&refresh_token',
    onEnter:  ['$log', '$window', '$location', '$timeout', '$rootScope', '$stateParams', 'authService', 'tokenService', 'appConfig',
      function ($log,   $window,   $location,   $timeout,   $rootScope,   $stateParams,   authService,   tokenService ,  appConfig) {

      var DEFAULT_SUCCESS_PATH = '/';
      var DEFAULT_ERROR_PATH   = '/';

      var req = $stateParams;

      var successPath = req.successPath || DEFAULT_SUCCESS_PATH;
      var errorPath   = req.errorPath   || DEFAULT_ERROR_PATH;
      if (successPath === 'postMessage' && !$window.opener) { successPath = DEFAULT_SUCCESS_PATH; }
      if (errorPath   === 'postMessage' && !$window.opener) { errorPath   = DEFAULT_ERROR_PATH; }

      if ($stateParams.access_token) {
        handleSuccessResponse(req);
      } else {
        handleErrorResponse(req);
      }

      function handleSuccessResponse (req) {
        $log.debug('<-- received a token at oauth2callback');
        var token;
        var tokenData = {
          accessToken : req.access_token,
          expiresIn   : parseInt(req.expires_in) || 0,
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

      function handleErrorResponse (req) {
        $log.debug('<-! error response at oauth2callback');
        if (errorPath === 'postMessage') {
          postMessage({
            name: 'oAuthError',
            data: 'auth callback did not return a token'
          });
        } else {
          // HACK
          // Replaces the entire href, otherwise /?error=... will remain visible
          // Preferred solution would be to use $location.url(), but since the ?error=... in the error callback url appears
          // before the #, Angular wouldn't remove it..
          reloadPath(errorPath);
        }
      }

      function postMessage (msgObj) {
        $log.debug('post token message to window.opener');
        var targetOrigin = $window.location.protocol + '//' + $window.location.host;
        $window.opener.postMessage(JSON.stringify(msgObj), targetOrigin);
      }

      function reloadPath (path) {
        var url =
          $window.location.protocol + '//' + $window.location.host +
          $window.location.pathname + '#' + path;
        $log.debug('replace entire url', url);
        $timeout(function () {
          $window.location.replace(url);
        }, 0);
      }

    }] // /onEnter

  });

});
