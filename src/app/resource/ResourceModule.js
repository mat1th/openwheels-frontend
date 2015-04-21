'use strict';

angular.module('owm.resource', [
  'owm.resource.create',
  'owm.resource.show',
  'owm.resource.show.calendar',
  'owm.resource.edit',
  'owm.resource.search',
  'owm.resource.filter',
  'owm.resource.filterDirective',
  'owm.resourceQueryService',
  'owm.resource.reservationForm',
  'owm.resource.favoriteIcon'
])

  .config(function config($stateProvider, $urlRouterProvider) {

    $stateProvider.state('owm.resource', {
      abstract: true,
      url: '/resource?lat&lng&start&end&text&radius&options&fuel&lock&seats&type',
      views: {
        'main@': {
          template: '<div ui-view></div>'
        }
      },
      /**
       * WORKAROUND FOR UI ROUTER ISSUE: $stateParams not updating after $location.search()
       * https://github.com/angular-ui/ui-router/issues/1546
       */
      onEnter: ['$stateParams', 'resourceQueryService', function ($stateParams, resourceQueryService) {
        resourceQueryService.parseStateParams($stateParams);
      }],
      resolve: {
        user: ['authService', function (authService) {
          return authService.userPromise();
        }]
      },
    });

    $stateProvider.state('owm.resource.search', {
      url: '',
      abstract: true,
      reloadOnSearch: false,
      views: {
        'main-full@': {
          controller: 'ResourceSearchController',
          templateUrl: 'resource/search/resource-search.tpl.html'
        }
      }
    });

    $stateProvider.state('owm.resource.search.list', {
      url: '',
      reloadOnSearch: false,
      controller: 'ResourceSearchListController',
      templateUrl: 'resource/search/list/resource-search-list.tpl.html'
    });

    $stateProvider.state('owm.resource.search.map', {
      url: '/map',
      reloadOnSearch: false,
      controller: 'ResourceSearchMapController',
      templateUrl: 'resource/search/map/resource-search-map.tpl.html'
    });


    /**
     * resource/create
     */
    $stateProvider.state('owm.resource.create', {
      url: '/create',
      controller: 'ResourceCreateController',
      templateUrl: 'resource/create/resource-create.tpl.html',
      data: {
        access: {deny: {anonymous: true}}
      },
      resolve: {
        me: ['authService', function (authService) {
          return authService.me();
        }],
        resources: ['authService', 'resourceService', function (authService, resourceService) {
          if (authService.user.isAuthenticated) {
            return authService.me().then(function (me) {
              return resourceService.forOwner({
                person: me.id
              });
            });
          } else {
            return null;
          }
        }]
      }
    });

    /**
     * resource/:resourceId
     * @resolve {promise} resource
     */
    $stateProvider.state('owm.resource.show', {
      url: '/:resourceId',
      views: {
        'main-full@': {
          controller: 'ResourceShowController',
          templateUrl: 'resource/show/resource-show.tpl.html',
        }
      },
      resolve: {
        resource: ['$stateParams', 'resourceService', function ($stateParams, resourceService) {
          var resourceId = $stateParams.resourceId;
          return resourceService.get({
            id: resourceId
          });
        }],
        me: ['authService', function (authService) {
          return authService.userPromise().then(function (user) {
            return user.isAuthenticated ? user.identity : null;
          });
        }]
      }
    });


    /**
     * resource/:resourceId
     * @resolve {promise} resource
     */
    $stateProvider.state('owm.resource.calendar', {
      url: '/:resourceId/calendar?view',
      controller: 'ResourceShowCalendarController',
      templateUrl: 'resource/show/calendar/resource-show-calendar.tpl.html',
      reloadOnSearch: true,
      resolve: {
        bookings: ['$stateParams', 'authService', 'bookingService', 'API_DATE_FORMAT', function ($stateParams, authService, bookingService, API_DATE_FORMAT) {
          var resourceId = $stateParams.resourceId;
          var startDate = moment().subtract(7, 'days').isoWeekday(1).hours(0).minutes(0).seconds(0);
          var endDate = moment().add(52, 'weeks');

          return bookingService.forResource({
            resource: resourceId,
            timeFrame: {
              startDate: startDate.format(API_DATE_FORMAT),
              endDate: endDate.format(API_DATE_FORMAT)
            }
          });
        }],
        blockings: ['$stateParams', 'calendarService', 'API_DATE_FORMAT', function ($stateParams, calendarService, API_DATE_FORMAT) {
          var resourceId = $stateParams.resourceId;
          var startDate = moment().subtract(7, 'days').isoWeekday(1).hours(0).minutes(0).seconds(0);
          var endDate = moment().add(52, 'weeks');

          return calendarService.between({
            resource: resourceId,
            timeframe: {
              startDate: startDate.format(API_DATE_FORMAT),
              endDate: endDate.format(API_DATE_FORMAT)
            }
          });
        }],
        me: ['authService', function (authService) {
          if (authService.isLoggedIn()) {
            return authService.me();
          }
          return null;
        }],
        resource: ['resourceService', '$stateParams', function (resourceService, $stateParams) {
          return resourceService.get({id: $stateParams.resourceId});
        }]
      }
    });

    /**
     * resource/:resourceId/edit
     * @resolve {promise} resource
     */
    $stateProvider.state('owm.resource.edit', {
      url: '/:resourceId/edit',
      controller: 'ResourceEditController',
      templateUrl: 'resource/edit/resource-edit.tpl.html',
      data: {
        access: { deny: { anonymous: true } }
      },
      resolve: {
        me: ['authService', function (authService) {
          return authService.me();
        }],
        resource: ['$stateParams', 'resourceService', function ($stateParams, resourceService) {
          var resourceId = $stateParams.resourceId;
          return resourceService.get({
            id: resourceId
          });
        }],
        members: ['$stateParams', 'resourceService', function ($stateParams, resourceService) {
          return resourceService.getMembers({
            resource: $stateParams.resourceId
          });
        }]
      }
    });



  })

;
