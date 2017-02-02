'use strict';

angular.module('owm.resource', [
  'owm.resource.create',
  'owm.resource.replace',
  'owm.resource.own',
  'owm.resource.show',
  'owm.resource.show.calendar',
  'owm.resource.edit',
  'owm.resource.search',
  'owm.resource.filter',
  'owm.resource.filterDirective',
  'owm.resourceQueryService',
  'owm.resource.reservationForm',
  'owm.resource.favoriteIcon',
  'owm.resource.parkingpermit',
  'owm.resource.insurance'
])

.config(function ($stateProvider) {

  $stateProvider.state('owm.resource', {
    abstract: true,
    url: '?lat&lng&start&end&text&radius&options&fuel&lock&seats&type&smartwheels&page',
    views: {
      'main@shell': {
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
    url: '/auto-huren',
    abstract: true,
    reloadOnSearch: false,
    views: {
      'main-full@shell': {
        controller: 'ResourceSearchController',
        templateUrl: 'resource/search/resource-search.tpl.html'
      }
    },
    data: {
      title: 'META_SEARCHPAGE_TITLE',
      description: 'META_SEARCHPAGE_DESCRIPTION'
    },
    resolve: {
      place: function () {
        return null;
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
    url: '/kaart',
    reloadOnSearch: false,
    controller: 'ResourceSearchMapController',
    templateUrl: 'resource/search/map/resource-search-map.tpl.html'
  });

  $stateProvider.state('owm.resource.place', {
    url: '/auto-huren/:city',
    abstract: true,
    reloadOnSearch: false,
    views: {
      'main-full@shell': {
        controller: 'ResourceSearchController',
        templateUrl: 'resource/search/resource-search.tpl.html'
      }
    },
    resolve: {
      place: ['$q', '$stateParams', 'placeService',
        function ($q, $stateParams, placeService) {
          return placeService.search({
            place: $stateParams.city
          }).catch(angular.noop); // ignore errors
        }
      ],
      metaInfo: ['$translate', 'place', 'metaInfoService',
        function ($translate, place, metaInfoService) {
          if (!place) {
            return;
          }
          return $translate('SITE_NAME').then(function () {
            metaInfoService.set({
              title: $translate.instant('META_CITYPAGE_TITLE', {
                city: place.name
              }),
              description: $translate.instant('META_CITYPAGE_DESCRIPTION', {
                city: place.name
              })
            });
          });
        }
      ]
    }
  });

  $stateProvider.state('owm.resource.place.list', {
    url: '',
    reloadOnSearch: false,
    controller: 'ResourceSearchListController',
    templateUrl: 'resource/search/list/resource-search-list.tpl.html',
    data: {
      access: {
        feature: 'cityPages'
      }
    }
  });

  $stateProvider.state('owm.resource.place.map', {
    url: '/kaart',
    reloadOnSearch: false,
    controller: 'ResourceSearchMapController',
    templateUrl: 'resource/search/map/resource-search-map.tpl.html',
    data: {
      access: {
        feature: 'cityPages'
      }
    }
  });
  /**
   * resource/own
   */
  $stateProvider.state('owm.resource.own', {
    url: '/mijn-auto',
    controller: 'ResourceOwnController',
    templateUrl: 'resource/own/resource-own.tpl.html',
    data: {
      access: {
        deny: {
          anonymous: true
        }
      }
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
   * resource/create
   */
  $stateProvider.state('owm.resource.create', {
    url: '/mijn-auto/create?licencePlate&dayPrice&numberOfDays&personSubmitted=false',
    abstract: true,
    reloadOnSearch: false,
    views: {
      'main-full@shell': {
        controller: 'ResourceCreateController',
        templateUrl: 'resource/create/resource-create.tpl.html'
      }
    },
    data: {
      access: {
        deny: {
          anonymous: true
        }
      }
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
   * /mijn-auto/create?licencePlate=23sdwe&dayPrice=26&numberOfDays=5&personSubmitted=false
   */

  $stateProvider.state('owm.resource.create.carInfo', {
    url: '?brand&color&model',
    reloadOnSearch: false,
    controller: 'carInfoControler',
    templateUrl: 'resource/create/carInfo/car-info.tpl.html'
  });

  /**
   * /mijn-auto/create/location?licencePlate=23sdwe&dayPrice=26&numberOfDays=5
   */

  $stateProvider.state('owm.resource.create.location', {
    url: '/location',
    reloadOnSearch: false,
    controller: 'locationControler',
    templateUrl: 'resource/create/location/location.tpl.html'
  });

  /**
   * /mijn-auto/create/phots?licencePlate=23sdwe&dayPrice=26&numberOfDays=5&personSubmitted=false
   */

  $stateProvider.state('owm.resource.create.carPhotos', {
    url: '/photos',
    reloadOnSearch: false,
    controller: 'carPhotosControler',
    templateUrl: 'resource/create/carPhotos/car-photos.tpl.html'
  });
  /**
   * /mijn-auto/create/details?licencePlate=23sdwe&dayPrice=26&numberOfDays=5&personSubmitted=false
   */

  $stateProvider.state('owm.resource.create.details', {
    url: '/details',
    reloadOnSearch: false,
    controller: 'carPersonDetailsControler',
    templateUrl: 'resource/create/details/details.tpl.html'
  });



  /**
   * resource/:resourceId
   * @resolve {promise} resource
   */
  $stateProvider.state('owm.resource.show', {
    url: '/auto-huren/:city/:resourceId?discountCode',
    views: {
      'main-full@shell': {
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
      }],
      metaInfo: ['$state', '$translate', '$filter', 'resource', 'metaInfoService', 'appConfig',
        function ($state, $translate, $filter, resource, metaInfoService, appConfig) {

          var substitutions = {
            city: resource.city,
            alias: resource.alias,
            owner: $filter('fullname')(resource.owner)
          };

          return $translate('SITE_NAME').then(function () {
            metaInfoService.set({
              title: $translate.instant('META_RESOURCE_TITLE', substitutions),
              description: $translate.instant('META_RESOURCE_DESCRIPTION', substitutions),
              url: appConfig.appUrl + $state.href('owm.resource.show', {
                resourceId: resource.id
              }),
              image: appConfig.serverUrl + '/' + $filter('resourceAvatar')(resource.pictures[0], 'normal')
            });
          });
        }
      ]
    }
  });


  /**
   * resource/:resourceId
   * @resolve {promise} resource
   */
  $stateProvider.state('owm.resource.calendar', {
    url: '/auto-huren/:city/:resourceId/kalender?view',
    controller: 'ResourceShowCalendarController',
    templateUrl: 'resource/show/calendar/resource-show-calendar.tpl.html',
    reloadOnSearch: true,
    resolve: {
      bookings: ['$stateParams', 'authService', 'bookingService', 'API_DATE_FORMAT', function ($stateParams, authService, bookingService, API_DATE_FORMAT) {
        var resourceId = $stateParams.resourceId;
        var startDate = moment().subtract(14, 'days').isoWeekday(1).hours(0).minutes(0).seconds(0);
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
        var startDate = moment().subtract(14, 'days').isoWeekday(1).hours(0).minutes(0).seconds(0);
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
        return resourceService.get({
          id: $stateParams.resourceId
        });
      }],

      metaInfo: ['$state', '$translate', '$filter', 'resource', 'metaInfoService', 'appConfig',
        function ($state, $translate, $filter, resource, metaInfoService, appConfig) {

          return $translate('SITE_NAME').then(function () {
            var substitutions = {
              city: resource.city,
              alias: resource.alias,
              owner: $filter('fullname')(resource.owner)
            };
            metaInfoService.set({
              title: $translate.instant('META_RESOURCE_TITLE', substitutions),
              description: $translate.instant('META_RESOURCE_DESCRIPTION', substitutions),
              url: appConfig.appUrl + $state.href('owm.resource.show', {
                resourceId: resource.id
              }),
              image: appConfig.serverUrl + '/' + $filter('resourceAvatar')(resource.pictures[0], 'normal')
            });
          });

        }
      ]
    }
  });
  
  /**
   * resource/:resourceId/replace
   */
  $stateProvider.state('owm.resource.replace', {
    url: '/auto/:resourceId/vervang',
    controller: 'ResourceReplaceController',
    templateUrl: 'resource/replace/resource-replace.tpl.html',
    data: {
      access: {
        deny: {
          anonymous: true
        }
      }
    },
    resolve: {
      me: ['authService', function (authService) {
        return authService.me();
      }],
      resource: ['$stateParams', 'resourceService', function ($stateParams, resourceService) {
        var resourceId = $stateParams.resourceId;
        console.log(resourceId);
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
  
  /**
   * resource/:resourceId/edit
   * @resolve {promise} resource
   */
  $stateProvider.state('owm.resource.edit', {
    url: '/auto/:resourceId/wijzigen',
    controller: 'ResourceEditController',
    templateUrl: 'resource/edit/resource-edit.tpl.html',
    data: {
      access: {
        deny: {
          anonymous: true
        }
      }
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
