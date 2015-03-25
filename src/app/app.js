'use strict';

angular.module('openwheels', [
  'ui.router',
  'ui.unique',
  'ui.bootstrap',
  'ui.calendar',
  'ui.sortable', // bower install ng-sortable
  'validation.match', // see vendor_custom

  'angularMoment',
  'uiGmapgoogle-maps',
  'ngStorage',
  'ngCookies',
  'pascalprecht.translate',
  'headroom',
  'geolocation',
  'geocoder',
  'ngAutocomplete',
  'ngSanitize',
  'ngScrollTo',
  'snap',

  'templates-app',
  'templates-common',
  'openwheels.analytics',
  'openwheels.social',

  // SERVICES

  // settings
  'openwheels.environment',
  'openwheels.config',
  'owm.featuresService',

  // api & authorization
  'api',
  'rpcServices',
  'authService',
  'tokenService',
  'oAuth2Callback',
  'oAuth2MessageListener',
  'stateAuthorizer',

  // storage & caching
  'cacheFactory',

  // other services
  'alertService',
  'dialogService',
  'DutchZipcodeService',
  'brandedFileLoader',
  'TimeFrameService',
  'windowSizeService',
  'owm.geoPositionService',

  // DIRECTIVES

  'form.validation',
  'pickadate',
  'timeframe',
  'datetimeDirective',
  'formGroupDirective',
  'nullIfEmpty',
  'ratingThumbDirective',
  'ratingThumbBinaryDirective',
  'badgeListDirective',
  'infoIconDirective',
  'fileInputDirective',
  'resourceCarouselDirective',
  'bookingDirectives',
  'personDirectives',
  'passwordStrengthDirective',
  'geocoderDirective',
  'socialDirectives',

  // FILTERS
  'filters.textUtil',
  'filters.dateUtil',
  'filters.getByPropertyFilter',
  'filters.fullname',
  'filters.avatar',
  'filters.ratingStars',
  'filters.dirty',
  'filters.reverse',
  'filters.percentage',
  'filters.bookingStatus',
  'filters.booking',
  'filters.translateOrDefault',

  // APP MODULES

  'owm',
  'owm.translate',
  'owm.auth',
  'owm.home',
  'owm.pages',
  'owm.resource',
  'owm.booking',
  'owm.person',
  'owm.finance',
  'owm.payment',
  'owm.trips',
  'owm.chat',
  'owm.message'
])


.constant('API_DATE_FORMAT', 'YYYY-MM-DD HH:mm')

.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
      key: 'AIzaSyAwytl2OG58LpFCTcIFN13gEBaSTh2aKF0',
      v: '3.18',
      libraries: 'places',
      language: 'nl',
      sensor: false
    });
  })

.config(function (snapRemoteProvider) {
  snapRemoteProvider.globalOptions.disable = 'left';
  snapRemoteProvider.globalOptions.hyperextensible = false;
  snapRemoteProvider.globalOptions.clickToDrag = false;
})

.config(function (appConfig, googleTagManagerProvider) {
  if (appConfig.gtmContainerId) {
    googleTagManagerProvider.init(appConfig.gtmContainerId);
  }
})

.config(function (appConfig, facebookProvider, twitterProvider) {
  if (appConfig.features.facebook && appConfig.fbAppId) {
    facebookProvider.init(appConfig.fbAppId);
  }
  if (appConfig.features.twitter) {
    twitterProvider.init();
  }
})

/**
 * Disable logging for non-development environments
 */
.config(function ($logProvider, ENV) {
  if (ENV !== 'development') {
    $logProvider.debugEnabled(false);
  }
})

.run(function (windowSizeService, oAuth2MessageListener, stateAuthorizer, authService, featuresService) {})

.run(function ($window, $log, $translate, $state, $stateParams, $rootScope, alertService, featuresService) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.showAsideMenu = false;
  $rootScope.isLanguageLoaded = false;

  // wait for async language file (angular-translate)
  $translate('SITE_NAME').then(function (siteName) {
    $rootScope.isLanguageLoaded = true;
    $rootScope.pageTitle = siteName;
  });

  $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState) {
    // show spinner
    alertService.load();
  });

  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
    $state.previous = fromState;

    // hide spinner
    alertService.loaded();

    // scroll to top
    angular.element($window).scrollTop(0);

    // set page title
    $translate('SITE_NAME').then(function (siteName) {
      if (toState.data && toState.data.pageTitle) {
        $rootScope.pageTitle = toState.data.pageTitle + ' | ' + siteName;
      } else {
        $rootScope.pageTitle = siteName;
      }
    });

    /**
     * Use new bootstrap container width on certain pages
     * (can be removed when implemented everywhere)
     */
    $rootScope.containerTransitional = (
      (featuresService.get('filtersSidebar')  && $state.includes('owm.resource.search')) ||
      (featuresService.get('resourceSidebar') && $state.includes('owm.resource.show')) ||
      $state.includes('member')
    );

  });

  // show an error on state change error
  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
    alertService.loaded();
    $log.debug('State change error', error);
    alertService.closeAll();
    alertService.add('danger', 'De opgevraagde pagina is niet beschikbaar', 5000);
  });
})
;

// MANUAL BOOTSTRAP

(function() {
  var injector = angular.injector(['ng']);
  var $http    = injector.get('$http');
  var $window  = injector.get('$window');
  var $q       = injector.get('$q');
  var $log     = injector.get('$log');

  if (!window.jasmine) {

    if ($window.location.host.indexOf('127.0.0.1') >= 0) {
      $window.location.replace($window.location.href.replace('127.0.0.1', 'localhost'));
    } else {

      // setup FastClick
      $window.addEventListener('load', function () {
        new FastClick(document);
      }, false);

      // merge configs + bootstrap
      angular.element($window.document).ready(function () {
        $q.all([configFile(), featuresFile()]).then(function (configs) {
          var config = angular.extend(configs[0], configs[1]);
          var ok = bootstrap(config);
          if (ok) {
            $log.debug('app running at ' + config.app_url);
          } else {
            console.log('Invalid configuration');
          }
        });
      });
    }
  }

  function bootstrap (config) {
    if (isValidConfig(config)) {
      angular.module('openwheels.config', []).constant('appConfig', {
        appId         : config.app_id,
        appSecret     : config.app_secret,
        appUrl        : config.app_url,
        serverUrl     : config.server_url,
        authEndpoint  : config.auth_endpoint,
        tokenEndpoint : config.token_endpoint,
        placesCountry : config.places_country || 'nl', // google places: default to nl
        gtmContainerId: config.gtm_container_id || null,
        fbAppId       : config.fb_app_id || null,
        features      : config.features || {}
      });
      angular.bootstrap(angular.element('html'), ['openwheels']);
      return true;
    }
    return false;
  }

  function configFile () {
    var dfd = $q.defer();
    $http.get('branding/config.json').then(function (response) {
      dfd.resolve(response.data);
    }).catch(function () {
      dfd.resolve({});
    });
    return dfd.promise;
  }

  function featuresFile () {
    var dfd = $q.defer();
    $http.get('branding/features.json').then(function (response) {
      dfd.resolve(response.data);
    }).catch(function () {
      dfd.resolve({});
    });
    return dfd.promise;
  }

  function isValidConfig (config) {
    return config &&
      config.app_id &&
      config.app_secret &&
      config.app_url &&
      config.server_url &&
      config.auth_endpoint &&
      config.token_endpoint;
  }

}());
