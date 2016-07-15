'use strict';

angular.module('owm.newRenter', [
  'owm.newRenter.controllers',
  'datetimeDirective',
  'owm.resource'
])
.config(function config($stateProvider, $urlRouterProvider) {

    $stateProvider.state('newRenter', {
      url: '/auto-huren/:city/:resourceId/reserveren?startTime&endTime&discountCode',
      abstract: true,
      parent: 'owm.resource',
      views: {
        'main@shell': {
          controller: 'NewRenterController',
          templateUrl: 'new-renter/new-renter/wrapper.tpl.html'
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
            endTime: $stateParams.endTime,
            discountCode: $stateParams.discountCode
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
      templateUrl: 'new-renter/new-renter/register.tpl.html'
    });

    $stateProvider.state('newRenter-booking', {
      url: '/boekauto',
      parent: 'newRenter',
      controller: 'NewRenterBookingController',
      templateUrl: 'new-renter/new-renter/booking.tpl.html',
      resolve: {
        person: ['authService', function (authService){
          return authService.authenticatedUser();
        }]
      }
    });
    $stateProvider
    .state('newrenter2', {
      abstract: true,
      parent: 'owm.resource',
      url: '/boeking',
      views: {
        'main@shell': {
          template: '<div ui-view></div>'
        }
      },
      data: {
        denyAnonymous: true
      },
      resolve: {
        me: ['authService', function (authService) {
          return authService.me();
        }]
      }
    })
    .state('newrenter2.extra-info', {
      url: '/extra-info',
      controller: 'NewRenterExtraInfoController',
      templateUrl: 'new-renter/new-renter2/extra-info.tpl.html'
    })
    .state('newrenter2.confirm', {
      url: '/bevestig',
      controller: 'NewRenterConfirmController',
      templateUrl: 'new-renter/new-renter2/confirm.tpl.html',
      onEnter: ['meHelperService', '$state', 'me', function(meHelper, $state, me) {
        if(!meHelper.isReadyToStartBooking(me)) {
          $state.go('newrenter2.extra-info');
          return false;
        }
        return true;
      }],
    });
  });
