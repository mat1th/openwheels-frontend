'use strict';

/*
USAGE

$stateProvider.state(name, {
  data: {
    denyAnonymous    : true | false,            - require login, e.g. dashboard
    denyAuthenticated: true | false,            - require anonymous user, e.g. signup page
    requiredFeatures : ['feature1', 'feature2'] - require one or more features
  }

  DEPRECATED, still working but doesn't work with nested states (UI Router only uses shallow inheritance for "data")
  data: {
    access: {
      anonymous    : true | false,
      authenticated: true | false,
      feature      : 'feature'
    }
  }
}
*/

angular.module('stateAuthorizer', [])

.service('stateAuthorizer', function ($log, $timeout, $rootScope, $state, $urlRouter, authService, tokenService, alertService, featuresService) {

  $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
    $log.debug('state change: ' + fromState.name + ' > ' + toState.name);

    /**
     * Verify token on every state change,
     * except for oauth2callback itself
     */
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

    var errorPath         = $state.href(fromState, fromParams);
    var successPath       = $state.href(toState, toParams);
    var data              = toState.data || {};
    var access            = data.access || {};
    var denyAuthenticated = data.denyAuthenticated || access.deny && access.deny.authenticated;
    var denyAnonymous     = data.denyAnonymous     || access.deny && access.deny.anonymous;
    var requiredFeatures  = data.requiredFeatures  || access.feature;
    var user = authService.user;
    var missingFeatures = [];

    if (requiredFeatures) {
      requiredFeatures = angular.isArray(requiredFeatures) ? requiredFeatures : [requiredFeatures];
    }

    /**
     * Wait for user, then try again
     */
    if (user.isPending && (denyAuthenticated || denyAnonymous)) {
      $log.debug('-?- state access (waiting for user)');

      e.preventDefault();

      authService.userPromise().finally(function (user) {
        $timeout(function () {
          $state.go(toState, toParams);
        }, 0);
      });
    }
    else {
      /**
       * Ensure anonymous
       */
      if (denyAuthenticated && user.isAuthenticated) {
        $log.debug('!!! state access denied, anonymous only > redirect to known safe place (=dashboard)...');

        e.preventDefault();

        $timeout(function () {
          alertService.loaded();
          $state.go('owm.person.dashboard');
        }, 0);
      }

      /**
       * Ensure authenticated
       */
      else if (denyAnonymous && !user.isAuthenticated) {
        $log.debug('!!! state access denied, should login > redirect');

        e.preventDefault();

        authService.loginRedirect(errorPath, successPath);
      }

      /**
       * Ensure features
       */
      else if (requiredFeatures) {
        missingFeatures = [];
        requiredFeatures.some(function (feature) {
          if (!featuresService.get(feature)) {
            missingFeatures.push(feature);
          }
        });
        if (missingFeatures.length) {
          $log.debug('feature(s) not enabled: ', missingFeatures);

          e.preventDefault();

          $timeout(function () {
            $state.go('home');
          });
        }
      }
    }

  });

});
