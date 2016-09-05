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
      'main@shell': {
        template: '<div ui-view></div>'
      }
    },
    data: {
      denyAnonymous: true
    },
    resolve: {
      booking: ['$stateParams', 'authService', 'bookingService', function ($stateParams, authService, bookingService) {
        return authService.me()
        .then( function(me) {
          return bookingService.get({
            id: $stateParams.bookingId
          });
        });
      }],
      contract: ['$stateParams', 'authService', 'contractService', function ($stateParams, authService, contractService) {
        return authService.me()
        .then(function(me) {
            return contractService.forBooking({
              booking: $stateParams.bookingId
            });
          })
        .then(function(contract) {
          contract.type.canHaveDeclaration = false;
          if(contract.type.id === 50 || contract.type.id === 60 || contract.type.id === 62) {
            contract.type.canHaveDeclaration = true;
          }
          return contract;
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

  /**
   * Accept a booking & redirect to booking detail
   */
  .state('owm.booking.accept', {
    url: '/accept',
    onEnter: ['$state', '$stateParams', '$filter', 'alertService', 'bookingService',
     function ($state ,  $stateParams ,  $filter ,  alertService ,  bookingService) {

      var bookingId = $stateParams.bookingId;
      bookingService.acceptRequest({ booking: bookingId }).then(function (booking) {
        alertService.add('success', $filter('translate')('BOOKING.ACCEPT.SUCCESS'), 8000);
      })
      .catch(alertService.addError)
      .finally(function () {
        $state.go('owm.booking.show', { bookingId: bookingId });
      });
    }]
  })

  /**
   * Reject a booking & redirect to booking detail
   */
  .state('owm.booking.reject', {
    url: '/reject',
    onEnter: ['$state', '$stateParams', '$filter', 'alertService', 'bookingService',
     function ($state ,  $stateParams ,  $filter ,  alertService ,  bookingService) {

      var bookingId = $stateParams.bookingId;
      bookingService.rejectRequest({ booking: bookingId }).then(function (booking) {
        alertService.add('success', $filter('translate')('BOOKING.REJECT.SUCCESS'), 8000);
      })
      .catch(alertService.addError)
      .finally(function () {
        $state.go('owm.booking.show', { bookingId: bookingId });
      });
    }]
  })

  .state('owm.booking.rating-renter', {
    url: '/rating/renter',
    templateUrl: 'booking/rating/booking-rating.tpl.html',
    controller: 'BookingRatingController',
    data: {
      requiredFeatures: ['ratings']
    },
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
    data: {
      requiredFeatures: ['ratings']
    },
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
