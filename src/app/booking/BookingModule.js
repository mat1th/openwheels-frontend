'use strict';

angular.module('owm.booking', [
  'owm.booking.timeframe',
  'owm.booking.list',
  'owm.booking.list-rental',
  'owm.booking.show',
  'owm.booking.rating',
  'owm.booking.administer'
])

.config(function config($stateProvider) {

  $stateProvider

  .state('owm.booking', {
    abstract: true,
    url: '/booking/:bookingId',
    views: {
      'main@': {
        template: '<div ui-view></div>'
      }
    },
    data: {
      access: { deny: { anonymous: true } }
    },
    resolve: {
      booking: ['$stateParams', 'authService', 'bookingService', function ($stateParams, authService, bookingService) {
        return authService.me().then( function(me) {
          return bookingService.get({
            id: $stateParams.bookingId
          });
        });
      }]
    }
  })

  .state('owm.booking.show', {
    url: '',
    templateUrl: 'booking/show/booking-show.tpl.html',
    controller: 'BookingShowController',
    resolve: {
      me: ['authService', function (authService) {
        return authService.me();
      }]
    }
  })

  .state('owm.booking.rating-renter', {
    url: '/rating/renter',
    templateUrl: 'booking/rating/booking-rating.tpl.html',
    controller: 'BookingRatingController',
    resolve: {
      rating: ['booking', 'ratingService', function (booking, ratingService) {
        return ratingService.getPrefill({ trip: booking.trip.id }).then(function (prefilledRating) {
          return prefilledRating || {};
        });
      }],
      userPerspective: function () {
        return 'renter';
      }
    }
  })

  .state('owm.booking.rating-owner', {
    url: '/rating/owner',
    templateUrl: 'booking/rating/booking-rating.tpl.html',
    controller: 'BookingRatingController',
    resolve: {
      rating: ['booking', 'ratingService', function (booking, ratingService) {
        return ratingService.getPrefill({ trip: booking.trip.id }).then(function (prefilledRating) {
          return prefilledRating || {};
        });
      }],
      userPerspective: function () {
        return 'owner';
      }
    }
  })

  .state('owm.booking.administer', {
    url: '/administer',
    templateUrl: 'booking/administer/booking-administer.tpl.html',
    controller: 'BookingAdministerController'
  })
  ;

})
;
