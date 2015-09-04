'use strict';

angular.module('owm.newRenter', [
  'owm.newRenter.controllers',
  'datetimeDirective',
  'owm.resource'
])
.config(function config($stateProvider, $urlRouterProvider) {

    $stateProvider.state('newRenter', {
      url: '/auto-huren/:city/:resourceId/reserveren?startTime&endTime',
      abstract: true,
      parent: 'owm.resource',
      views: {
        'main-full@': {
          controller: 'NewRenterController',
          templateUrl: 'newRenter/newRenter/wrapper.tpl.html'
        }
      },
      data: {
        access: {
          feature: 'bookingSignupWizard'
        }
      },
      resolve: {
        booking: ['$stateParams', function ($stateParams) {
          return {
            startTime: $stateParams.startTime,
            endTime:   $stateParams.endTime
          };
        }],
        resource: ['$stateParams', 'resourceService', function ($stateParams, resourceService) {
          var resourceId = $stateParams.resourceId;
          return resourceService.get({
            id: resourceId
          });
        }]
      }
    });

    $stateProvider.state('newRenter-register', {
      url: '/aanmelden',
      parent: 'newRenter',
      controller: 'NewRenterRegisterController',
      templateUrl: 'newRenter/newRenter/register.tpl.html'
    });

    $stateProvider.state('newRenter-deposit', {
      url: '/betaal-borg',
      parent: 'newRenter',
      controller: 'NewRenterDepositController',
      templateUrl: 'newRenter/newRenter/borg.tpl.html',
    });

    $stateProvider.state('newRenter-depositResult', {
      url: '/betaal-borg/:state',
      parent: 'newRenter',
      template: '<div class="card"><div class="card-body">' +
                '<b>De iDEAL-betaling is niet voltooid. Heb je wel een betaling gedaan? Neem dan s.v.p. contact met ons op.</b>' +
                '</div></div>'
    });

    $stateProvider.state('newRenter-booking', {
      url: '/boekauto',
      parent: 'newRenter',
      controller: 'NewRenterBookingController',
      templateUrl: 'newRenter/newRenter/booking.tpl.html',
      resolve: {
        person: ['authService', function (authService){
          return authService.authenticatedUser();
        }]
      }
    });
  });


