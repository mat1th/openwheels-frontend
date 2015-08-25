'use strict';

angular.module('owm.newrenter', [
  'datetimeDirective',
  'owm.resource'
])
.config(function config($stateProvider, $urlRouterProvider) {
    $stateProvider.state('new_renter', {
      url: '/auto-huren/:city/:resourceId/reserveren?startTime$endTime',
      abstract: true,
      parent: 'owm.resource',
      views: {
        'main-full@': {
          controller: 'NewRenterController',
          templateUrl: 'newrenter/new_renter/create-booking.tpl.html'
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
    
    $stateProvider.state('new_renter-create_booking', {
      url: '/aanmelden',
      parent: 'new_renter',
      controller: 'RegistreerController',
      templateUrl: 'newrenter/new_renter/register-person.tpl.html'
    });
    
    $stateProvider.state('new_renter-betaal_borg', {
      url: '/betaal-borg',
      parent: 'new_renter',
      controller: 'BorgController',
      templateUrl: 'newrenter/new_renter/borg.tpl.html',
    });
    
    $stateProvider.state('new_renter-return_borg', {
      url: '/betaal-borg/{state}',
      parent: 'new_renter',
      //controller: '',
      template: '<h3> hoeraa </h3>'
    });
    
    $stateProvider.state('new_renter-bookresource', {
      url: '/boekauto',
      parent: 'new_renter',
      controller: 'NewuserCreateBookingController',
      templateUrl: 'newrenter/new_renter/booking.tpl.html',
      resolve: {
        person: ['authService', function (authService){
          return authService.authenticatedUser();
        }]
      }
    });
  });


