'use strict';

angular.module('openwheels', [

  /* Framework */
  'ngAria',
  'ngAnimate',
  'ngCookies',
  'ngMaterial',
  'ngMessages',
  'ngSanitize',

  /* Tools */
  'ui.router',
  'ui.unique',
  'ui.bootstrap',
  'ui.calendar',
  'ui.sortable', // bower install ng-sortable
  'validation.match', // see vendor_custom
  'angularMoment',
  'uiGmapgoogle-maps',
  'ngStorage',
  'pascalprecht.translate',
  'geolocation',
  'geocoder',
  'ngAutocomplete',
  'ngScrollTo',

  /* Auto-generated */
  'templates-app',
  'templates-common',
  'openwheels.environment',
  'openwheels.config',

  /* API communication & access control */
  'api',
  'rpcServices',
  'authService',
  'tokenService',
  'oAuth2Callback',
  'oAuth2MessageListener',
  'stateAuthorizer',

  /* Services */
  'alertService',
  'dialogService',
  'DutchZipcodeService',
  'brandedFileLoader',
  'TimeFrameService',
  'windowSizeService',
  'owm.geoPositionService',
  'owm.linksService',
  'owm.featuresService',
  'owm.metaInfoService',
  'ng-optimizely',

  /* Directives */
  'form.validation',
  'pickadate',
  'timeframe',
  'datetimeDirective',
  'formGroupDirective',
  'bindingDirectives',
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
  'bindMetaDirective',

  /* Filters */
  'filters.util',
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

  /* Components */
  'openwheels.analytics',
  'openwheels.social',
  'owm.shell',
  'owm.alert',
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
  'owm.message',
  'owm.newRenter',
  'owm.livehelperchat',
  'owm.discount',
  'owm.contract'
])

.constant('API_DATE_FORMAT', 'YYYY-MM-DD HH:mm')

.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {
  $locationProvider.html5Mode(true);

  /**
   * Prevent infinite loop when requesting non-existing url
   * see https://github.com/angular-ui/ui-router/issues/600
   */
  $urlRouterProvider.otherwise(function ($injector, $location) {
    var $state = $injector.get('$state');
    $state.go('home');
  });

  /**
   * Force server reload for these urls:
   */
  $stateProvider.state('aanmelden', {
    url: '/aanmelden',
    onEnter: ['$window', function ($window) {
      $window.location.reload();
    }]
  });
  $stateProvider.state('autodelen', {
    url: '/autodelen',
    onEnter: ['$window', function ($window) {
      $window.location.reload();
    }]
  });
  $stateProvider.state('autodelen2', {
    url: '/autodelen/*path',
    onEnter: ['$window', function ($window) {
      $window.location.reload();
    }]
  });
})

.config(function (uiGmapGoogleMapApiProvider) {
  uiGmapGoogleMapApiProvider.configure({
    key: 'AIzaSyAwytl2OG58LpFCTcIFN13gEBaSTh2aKF0',
    v: '3.23.0',
    libraries: 'places',
    language: 'nl'
  });
})

.config(function (appConfig, googleTagManagerProvider) {
  if (appConfig.gtmContainerId) {
    googleTagManagerProvider.init(appConfig.gtmContainerId);
  }
})
.config(function (appConfig, googleAnalyticsProvider) {
  if (appConfig.ga_tracking_id) {
    googleAnalyticsProvider.init(appConfig.ga_tracking_id);
  }
})

.config(function (appConfig, facebookProvider, twitterProvider) {
    // if (appConfig.features.facebook && appConfig.fbAppId) {
    //   facebookProvider.init(appConfig.fbAppId);
    // }
    // if (appConfig.features.twitter) {
    //   twitterProvider.init();
    // }
})
/**
 * Disable logging for non-development environments
 */
.config(function ($logProvider, ENV) {
  if (ENV !== 'development') {
    $logProvider.debugEnabled(false);
  }
})
.config(function (optimizelyProvider) {
  optimizelyProvider.setKey('5390511383');
  optimizelyProvider.setActivationEventName('$stateChangeSuccess');
})
.run(function (optimizely) {
  optimizely.loadProject();
})


.run(function (windowSizeService, oAuth2MessageListener, stateAuthorizer, authService, featuresService) {
  /* Intentionally left blank */
})

.run(function ($window, $log, $timeout, $state, $stateParams, $rootScope, $anchorScroll,
  alertService, featuresService, linksService, metaInfoService) {

  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.isLanguageLoaded = false;

  $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState) {
    // show spinner
    alertService.load();
  });

  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
    $state.previous = fromState;

    // hide spinner
    alertService.loaded();

    // scroll to top, except for place pages (for toggling map <--> list)
    // depends on presence of DOM-element with id="scroll-to-top-anchor"
    // TODO(?): move to a better place
    if (['owm.resource.place.list', 'owm.resource.place.map'].indexOf(toState.name) < 0) {
      $anchorScroll('scroll-to-top-anchor');
    }

    // set page title
    if (!metaInfoService.isSet('title') && toState.data) {
      metaInfoService.setTranslated({
        title: toState.data.title,
        description: toState.data.description
      });
    }
    metaInfoService.flush();

    /**
     * Use new bootstrap container width on certain pages
     * (can be removed when implemented everywhere)
     */
    $rootScope.containerTransitional = (
      (featuresService.get('filtersSidebar') && $state.includes('owm.resource.search')) ||
      (featuresService.get('filtersSidebar') && $state.includes('owm.resource.place')) ||
      (featuresService.get('resourceSidebar') && $state.includes('owm.resource.show')) ||
      $state.includes('member')
    );
    $rootScope.containerHome = (
      ($state.includes('home'))
    );


  });

  // show an error on state change error
  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
    alertService.loaded();
    $log.debug('State change error', error);
    alertService.closeAll();

    if (!fromState.name) {
      $timeout(function () {
        $state.go('home');
      }, 0);
    } else {
      // (stay on same page)
      alertService.add('danger', error.message || 'Woops, er is iets mis gegaan', 5000);
    }
  });
});

// MANUAL BOOTSTRAP

(function () {
  var injector = angular.injector(['ng']);
  var $http = injector.get('$http');
  var $window = injector.get('$window');
  var $q = injector.get('$q');
  var $log = injector.get('$log');

  if (!window.jasmine) {

    if ($window.location.host.indexOf('127.0.0.1') >= 0) {
      $window.location.replace($window.location.href.replace('127.0.0.1', 'localhost'));
    } else {

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

  function bootstrap(config) {
    if (isValidConfig(config)) {
      angular.module('openwheels.config', []).constant('appConfig', {
        appId: config.app_id,
        appSecret: config.app_secret,
        appUrl: config.app_url,
        serverUrl: config.server_url,
        authEndpoint: config.auth_endpoint,
        tokenEndpoint: config.token_endpoint,
        gtmContainerId: config.gtm_container_id || null,
        ga_tracking_id: config.ga_tracking_id || null,
        fbAppId: config.fb_app_id || null,
        features: config.features || {}
      });
      angular.bootstrap(angular.element('html'), ['openwheels']);
      return true;
    }
    return false;
  }

  function configFile() {
    var dfd = $q.defer();
    $http.get('branding/config.json?v=' + moment().format('YYMMDDHHmmss')).then(function (response) {
      dfd.resolve(response.data);
    }).catch(function () {
      dfd.resolve({});
    });
    return dfd.promise;
  }

  function featuresFile() {
    var dfd = $q.defer();
    $http.get('branding/features.json?v=' + moment().format('YYMMDDHHmmss')).then(function (response) {
      dfd.resolve(response.data);
    }).catch(function () {
      dfd.resolve({});
    });
    return dfd.promise;
  }

  function isValidConfig(config) {
    return config &&
      config.app_id &&
      config.app_secret &&
      config.app_url &&
      config.server_url &&
      config.auth_endpoint &&
      config.token_endpoint;
  }
}());
