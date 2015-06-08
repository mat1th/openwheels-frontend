'use strict';

angular.module('stateAuthorizer', [])

.service('stateAuthorizer', function ($log, $timeout, $rootScope, $state, $urlRouter, authService, tokenService, alertService, featuresService) {

  $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {

    $log.debug('state change: ' + fromState.name + ' > ' + toState.name);

    if (toState.name === 'oauth2callback') { return; }

    var savedToken = tokenService.getToken();
    if (savedToken) {
      if (savedToken.isExpired()) {
        $log.debug('saved token is expired');
        savedToken.refresh().then(function (freshToken) {
          $log.debug('authenticate using refreshed token');
          authService.notifyFreshToken(freshToken);
        })
        .catch(function (err) {
          $log.debug('cannot refresh token, clear token');
          tokenService.clearToken();
          authService.notifyAnonymous();
        });
      }
      else {
        authService.notifyFreshToken(savedToken);
      }
    } else {
      authService.notifyAnonymous();
    }

    var errorPath   = $state.href(fromState, fromParams);
    var successPath = $state.href(toState, toParams);
    var access      = toState.data ? toState.data.access || {} : {};
    var allow       = access.allow;
    var deny        = access.deny;
    var feature     = access.feature;
    var user;

    if (allow || deny || feature) {

      if (authService.user.isPending) {
        e.preventDefault();

        $log.debug('-?- state access (waiting for user)');
        authService.userPromise().finally(function (user) {
          $timeout(function () {
            $state.go(toState, toParams);
          }, 0);
        });
      }
      else {
        user = authService.user;

        if (deny && deny.authenticated && user.isAuthenticated) {
          $log.debug('!!! state access denied, anonymous only > redirect to known safe place (=dashboard)...');
          e.preventDefault();
          $timeout(function () {
            alertService.loaded();
            $state.go('owm.person.dashboard');
          }, 0);
        }

        if (deny && deny.anonymous && !user.isAuthenticated) {
          e.preventDefault();
          $log.debug('!!! state access denied, should login > redirect');
          authService.loginRedirect(errorPath, successPath);
        }

        if (feature && !featuresService.get(feature)) {
          e.preventDefault();
          $log.debug('feature not enabled');
          $timeout(function () {
            $state.go('home');
          });
        }
      }
    }

  });

});
