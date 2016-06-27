'use strict';

angular.module('owm.person.dashboard', [])

.controller('PersonDashboardController', function ($q, $scope, $sce, $state, me, bookingList, rentalList, actions,
  authService, bookingService, alertService, boardcomputerService, actionService, resourceService, resourceQueryService, blogItems) {

  $scope.me = me;
  $scope.blogItems = blogItems;
  $scope.bookings = bookingList.bookings;
  $scope.rentals = rentalList.bookings;
  $scope.actions = actions;
  $scope.favoriteResources = null;
  $scope.search = { text: '' };
  if (me.preference !== 'owner') {
    loadFavoriteResources();
  }

  $scope.renderHtml = function(html_code) {
    return $sce.trustAsHtml(html_code);
  };

  $scope.doSearch = function (placeDetails) {
    if (placeDetails) {
      resourceQueryService.setText($scope.search.text);
      resourceQueryService.setLocation({
        latitude : placeDetails.geometry.location.lat(),
        longitude: placeDetails.geometry.location.lng()
      });
    }
    $state.go('owm.resource.search.list', resourceQueryService.createStateParams());
  };

  $scope.allowBoardComputer = function (booking) {
    return (booking.status === 'accepted' &&
      booking.resource.locktypes.indexOf('smartphone') >= 0 &&
      booking.beginBooking && booking.endBooking &&
      moment().isAfter(moment(booking.beginBooking).add(-5, 'minutes')) && // hooguit 5 minuten geleden begonnen
      moment().isBefore(moment(booking.endBooking).add(1, 'hours')) // hooguit een uur geleden afgelopen
    );
  };

  $scope.openDoor = function(resource, booking) {
    alertService.load();
    boardcomputerService.control({
      action: 'OpenDoorStartEnable',
      resource: resource.id,
      booking: booking ? booking.id : undefined
    })
    .then( function(result) {
      if(result === 'error') {
        return alertService.add('danger', result, 5000);
      }
      alertService.add('success', 'Boardcomputer opened door and enabled start', 3000);
    }, function(error) {
      alertService.add('danger', error.message, 5000);
    })
    .finally( function() {
      alertService.loaded();
    });
  };

  $scope.closeDoor = function(resource, booking) {
    alertService.load();
    boardcomputerService.control({
      action: 'CloseDoorStartDisable',
      resource: resource.id,
      booking: booking ? booking.id : undefined
    })
    .then( function(result) {
      if(result === 'error') {
        return alertService.add('danger', result, 5000);
      }
      alertService.add('success', 'Boardcomputer closed door and disabled start', 3000);
    }, function(error) {
      alertService.add('danger', error.message, 5000);
    })
    .finally( function() {
      alertService.loaded();
    });
  };

  $scope.deleteAction = function (action) {
    alertService.load();
    actionService.delete({ action: action.id })
    .then(function (result) {
      if (result.deleted === true) {
        $scope.actions.splice($scope.actions.indexOf(action), 1);
      } else {
        return $q.reject(new Error('De actie kan niet worden verwijderd'));
      }
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded();
    });
  };

  function loadFavoriteResources () {
    resourceService.getFavorites({ maxResults: 3 }).then(function (favoriteResources) {
      $scope.favoriteResources = favoriteResources || [];
    })
    .catch(function () {
      $scope.favoriteResources = [];
    });
  }

  $scope.selectFavoriteResource = function (resource) {
    $state.go('owm.resource.show', { resourceId: resource.id, city: resource.city });
  };

})
;
