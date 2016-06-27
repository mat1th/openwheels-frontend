'use strict';

angular.module('owm.pages', [
  'owm.pages.list-your-car',
  'owm.pages.list-your-car-login',
  'owm.pages.member',
  'owm.pages.emailPreference',
])

.config(function ($stateProvider) {

  $stateProvider

  .state('home', {
    url: '/',
    parent: 'owm',
    views: {
      'main-full@shell': {
        templateUrl: 'home/home.tpl.html',
        controller: 'HomeController'
      }
    },
    data: {
      access: { deny: { authenticated: true } }
    }
  })

  .state('owm.pages', {
    resolve: {
      user: ['authService', function (authService) {
        return authService.userPromise();
      }]
    }
  })

  .state('list-your-car', {
    parent: 'owm.pages',
    url: '/auto-verhuren',
    views: {
      'main-full@shell': {
        templateUrl: 'pages/list-your-car/list-your-car.tpl.html',
        controller : 'ListYourCarController'
      }
    },
    data: {
      title: 'META_LISTYOURCAR_TITLE',
      description: 'META_LISTYOURCAR_DESCRIPTION',
      access: {
        feature: 'verhuurTussenscherm'
      }
    }
  })

  .state('list-your-car-login', {
    parent: 'owm.pages',
    url: '/auto-verhuren/deel-auto-aanmelden',
    views: {
      'main-full@shell': {
        templateUrl: 'pages/list-your-car/list-your-car-login.tpl.html',
        controller : 'ListYourCarLoginController'
      }
    },
    data: {
      title: 'META_LISTYOURCAR2_TITLE',
      description: 'META_LISTYOURCAR2_DESCRIPTION',
      access: {
        feature: 'verhuurTussenscherm'
      }
    }
  })

  .state('member', {
    parent: 'owm.pages',
    url: '/lid/:personId',
    views: {
      'main-full@shell': {
        templateUrl: 'pages/member/member.tpl.html',
        controller: 'MemberController'
      }
    },
    resolve: {
      member: ['$stateParams', 'personService', function ($stateParams, personService) {
        return personService.get({ version: 2, person: $stateParams.personId });
      }]
    }
  })

  .state('emailPreference', {
    parent: 'owm.pages',
    url: '/email-uitschrijven?person&hash',
    views: {
      'main@shell': {
        templateUrl: 'pages/email-preference/emailPreference.tpl.html',
        controller: 'EmailPreferenceController'
      }
    }
  });

});
