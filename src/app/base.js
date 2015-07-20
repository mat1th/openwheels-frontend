'use strict';

angular.module('owm', [
  'owm.navigation',
  'owm.alert',
  'owm.footer'
])

.config(function myAppConfig($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise(function ($injector, $location) {
    // workaround for https://github.com/angular-ui/ui-router/issues/600
    // $urlRouterProvider.otherwise('/') would cause infinite loop when requesting a non-existing url
    var $state = $injector.get('$state');
    $state.go('home');
  });

  $stateProvider.state('base', {
    resolve: {
      isLanguageLoaded: ['$q', '$rootScope', function ($q, $rootScope) {
        var dfd = $q.defer();
        var unbindWatch = $rootScope.$watch('isLanguageLoaded', function (isLoaded) {
          if (isLoaded) {
            unbindWatch();
            dfd.resolve();
          }
        });
        return dfd.promise;
      }]
    }
  });

  $stateProvider.state('home', {
    url: '/',
    parent: 'base',
    views: {
      'main-full@': {
        templateUrl: 'home/home.tpl.html',
        controller: 'HomeController'
      },
      'navigation@': {
        templateUrl: 'navigation/navigation.tpl.html',
        controller: 'NavigationController'
      },
      'footer@': {
        templateUrl: 'footer/footer.tpl.html',
        controller: 'FooterController'
      }
    },
    data: {
      access: {
        deny: { authenticated: true }
      }
    }
  });

  $stateProvider.state('owm', {
    url: '',
    parent: 'base',
    abstract: true,
    views: {
      'navigation@': {
        templateUrl: 'navigation/navigation.tpl.html',
        controller: 'NavigationController'
      },
      'footer@': {
        templateUrl: 'footer/footer.tpl.html',
        controller: 'FooterController'
      }
    }
  });
})

;
