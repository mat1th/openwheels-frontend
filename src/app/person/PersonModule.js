'use strict';

angular.module('owm.person', [
    'owm.person.dashboard',
    'owm.person.dashboard.v1',
    'owm.person.profile',
    'owm.person.action.payinvoicegroup',
    'owm.person.license',
    'owm.person.anwbId',
    'owm.person.account',
    'owm.person.fileread',
  ])

  .config(function config($stateProvider) {
    /**
     * person
     */
    $stateProvider.state('owm.person', {
      abstract: true,
      url: '/dashboard',
      data: {
        access: { deny: { anonymous: true } }
      },
      resolve: {
        me: ['authService', function (authService) {
          return authService.me();
        }]
      }
    });

    /**
     * dashboard
     */
    $stateProvider.state('owm.person.dashboard', {
      url: '',
      views: {
        'main@shell': {
          templateUrl: 'person/dashboard/person-dashboard.tpl.html',
          controller: 'PersonDashboardController'
        },
        'main-full@shell': {
          templateUrl: 'person/dashboard/person-dashboard-hero.tpl.html',
          controller: 'PersonDashboardHeroController'
        }
      },
      resolve: {
        blogItems: ['$http', '$translate', function ($http, $translate) {
          return $translate('BLOG_URL')
          .then(function (url) {
            if (!url) { return {}; }
            return $http.get(url);
          })
          .then(function (response) {
            var maxResults = 2;
            if (response.data && response.data.items) {
              return response.data.items.slice(0, maxResults);
            }
            return [];
          })
          .catch(function () {
            return [];
          });
        }],
                      
        bookingList: ['$stateParams', 'me', 'authService', 'bookingService', 'API_DATE_FORMAT', function ($stateParams, me, authService, bookingService, API_DATE_FORMAT) {
          var timeFrame = {
            startDate: moment().add(-1, 'hours').format(API_DATE_FORMAT),
            endDate: moment().startOf('day').add(1, 'years').format(API_DATE_FORMAT)
          };
          if (me.preference === 'owner') {
            return {
              bookings: null,
              timeFrame: timeFrame
            };
          }
          return bookingService.getBookingList({
            person: me.id,
            timeFrame: timeFrame
          })
            .then(function (bookings) {
              return {
                bookings: bookings,
                timeFrame: timeFrame
              };
            });
        }],
        rentalList: ['$stateParams', 'me', 'authService', 'bookingService', 'API_DATE_FORMAT', function ($stateParams, me, authService, bookingService, API_DATE_FORMAT) {
          var timeFrame = {
            startDate: moment().startOf('day').add(-1, 'weeks').format(API_DATE_FORMAT),
            endDate: moment().startOf('day').add(1, 'years').format(API_DATE_FORMAT)
          };

          if (me.preference === 'renter') {
            return {
              bookings: null,
              timeFrame: timeFrame
            };
          }
          return bookingService.forOwner({
            person: me.id,
            timeFrame: timeFrame
          })
            .then(function (bookings) {
              return {
                bookings: bookings,
                timeFrame: timeFrame
              };
            });
        }],
        actions: ['actionService', 'me', function (actionService, me) {
          return actionService.all({ person: me.id });
        }]
      }
    });
   
     /**
     * dashboard/profile
     */
    $stateProvider.state('owm.person.profile', {
      url: '/profile',
      views: {
        'main@shell': {
          templateUrl: 'person/profile/person-profile.tpl.html',
          controller: 'PersonProfileController'
        }
      },
      resolve: {
        person: ['personService', function (personService) {
          return personService.me({ version: 2 });
        }]
      }
    });

    /**
     * action
     */
    $stateProvider.state('owm.person.action', {
      abstract: true,
      url: '/action',
      views: {
        'main@shell': {
          template: '<ui-view></ui-view>'
        }
      }
    });

    /**
     * dashboard
     */
    $stateProvider.state('owm.person.action.resendactivationmail', {
      url: '/resendactivationmail',
      onEnter: ['me', 'personService', 'alertService', '$state', '$translate', function (me, personService, alertService, $state, $translate) {
        personService.alterEmail({
            id: me.id,
            email_adres: me.email
          }
        ).then(function () {
            alertService.add('success', $translate.instant('ACTIVATION_MAIL_RESEND_SUCCESS'), 5000);
          },
          function() {
            alertService.add('warning',  $translate.instant('ACTIVATION_MAIL_RESEND_FAIL'), 5000);
          }
        ).finally(function () {
            $state.go('owm.person.dashboard');
          });
      }
      ]
    })
    ;

    /**
     * dashboard
     */
    $stateProvider.state('owm.person.action.payinvoicegroup', {
      url: '/payinvoicegroup?invoiceGroupId',
      templateUrl: 'person/action/payinvoicegroup/person-action-payinvoicegroup.tpl.html',
      controller: 'PersonActionPayInvoiceGroupController',
      resolve: {
        paymentData: ['$stateParams', 'idealService', function ($stateParams, idealService) {
          return idealService.payInvoiceGroup({invoiceGroup: $stateParams.invoiceGroupId});
        }]
      }

    })
    ;

    /**
     * dashboard/chipcards
     */
    $stateProvider.state('owm.person.chipcard', {
      url: '/chipcards',
      views: {
        'main@shell': {
          templateUrl: 'person/chipcard/list/person-chipcards.tpl.html',
          controller: 'PersonChipcardsController'
        }
      },
      resolve: {
        chipcards: ['authService', 'chipcardService', function (authService, chipcardService) {
          var chipcardsPromise = authService.me().then(function (me) {
            return chipcardService.forPerson({
              person: me.id,
              onlyActive: true
            });
          });
          return chipcardsPromise;
        }]
      }
    });


    // dashboard/contracts
    $stateProvider.state('owm.person.contract', {
      url: '/contracts',
      views: {
        'main@shell': {
          templateUrl: 'person/contract/index/person-contract-index.tpl.html',
          controller: 'PersonContractIndexController'
        }
      }
    });

    $stateProvider.state('owm.person.anwbId', {
      url: '/anwb-id',
      views: {
        'main@shell': {
          templateUrl: 'person/anwbId/personAnwbId.tpl.html',
          controller : 'PersonAnwbIdController'
        }
      }
    });

    // dashboard/license
    $stateProvider.state('owm.person.license', {
      url: '/license',
      views: {
        'main@shell': {
          templateUrl: 'person/license/person-license.tpl.html',
          controller: 'PersonLicenseController'
        }
      }
    });

  })
;
