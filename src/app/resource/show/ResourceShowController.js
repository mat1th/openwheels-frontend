'use strict';

angular.module('owm.resource.show', [])

.controller('ResourceShowController', function ($window, $log, $q, $timeout, $location, $scope, $state, $filter,
  authService, resourceService, bookingService, invoice2Service, boardcomputerService, alertService, chatPopupService, API_DATE_FORMAT,
  resource, me, resourceQueryService, featuresService, $stateParams, linksService) {

  /**
   * Warning: 'me' will be null for anonymous users
   */

  $scope.booking = {};
  $scope.resource = resource;
  $scope.me = me;
  $scope.showBookingForm = false;
  $scope.showBookingFormToggle = true;

  $scope.openChatWith = openChatWith;
  $scope.isFavoriteResolved = false;
  $scope.toggleFavorite = toggleFavorite;

  $scope.shareUrl = featuresService.get('serverSideShare') ? linksService.resourceUrl(resource.id, resource.city) : $window.location.href;
  $log.debug('Share url = ' + $scope.shareUrl);

  loadSearchState();
  if (me) { loadFavorite(); } else { $scope.isFavoriteResolved = true; }

  function openChatWith (otherPerson) {
    var otherPersonName = $filter('fullname')(otherPerson);
    chatPopupService.openPopup(otherPersonName, otherPerson.id, resource.id, null);
  }

  function loadSearchState () {
    var timeFrame = resourceQueryService.data.timeFrame;
    if (timeFrame) {
      $scope.booking.beginRequested = timeFrame.startDate;
      $scope.booking.endRequested   = timeFrame.endDate;
    }
    $location.search(resourceQueryService.createStateParams());
  }

  angular.extend($scope, {
    map: {
      center: {
        latitude: resource.latitude,
        longitude: resource.longitude
      },
      draggable: true,
      markers: [{
        idKey: 1,
        latitude: resource.latitude,
        longitude: resource.longitude,
        title: resource.alias
      }], // an array of markers,
      zoom: 14,
      options: {
        scrollwheel: false
      }
    }
  });

  $scope.openDoor = function(resource) {
    alertService.load();
    boardcomputerService.control({
      action: 'OpenDoorStartEnable',
      resource: resource.id
    })
    .then( function(response) {
      if(response.result === 'ERROR') {
        return alertService.add('danger', response.message, 5000);
      }
      alertService.add('success', 'Boardcomputer opened door and enabled start', 3000);
    }, function(error) {
      alertService.add('danger', error.message, 5000);
    })
    .finally( function() {
      alertService.loaded();
    });
  };

  $scope.closeDoor = function(resource) {
    alertService.load();
    boardcomputerService.control({
      action: 'CloseDoorStartDisable',
      resource: resource.id
    })
    .then( function(response) {
      if(response.result === 'ERROR') {
        return alertService.add('danger', response.message, 5000);
      }
      alertService.add('success', 'Boardcomputer closed door and disabled start', 3000);
    }, function(error) {
      alertService.add('danger', error.message, 5000);
    })
    .finally( function() {
      alertService.loaded();
    });
  };

  function loadFavorite () {
    $scope.isFavoriteResolved = false;

    var dfd = $q.defer();
    dfd.promise.then(function (bool) {
      $scope.isFavorite = bool;
    })
    .finally(function () {
      $scope.isFavoriteResolved = true;
    });

    resourceService.getFavorites({ maxResults: 3 }).then(function (favoritesRecentsAndSuggestions) {
      var isFavorite;
      angular.forEach(favoritesRecentsAndSuggestions, function (candidate) {
        isFavorite = isFavorite || (candidate.label === 'favorite' && candidate.id === resource.id);
      });
      dfd.resolve(isFavorite);
    })
    .catch(function () {
      dfd.resolve(false);
    });
  }

  function toggleFavorite (bool) {
    var params = { resource: resource.id };
    var method = bool ? resourceService.addFavorite : resourceService.removeFavorite;

    $scope.isFavoriteResolved = false;
    method(params).then(function () {
      $scope.isFavorite = bool;
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      $scope.isFavoriteResolved = true;
    });
  }

  $scope.toggleBookingForm = function () {
    $scope.showBookingForm = !!!$scope.showBookingForm;
    $scope.showBookingFormToggle = !!!$scope.showBookingFormToggle;

    if (!$scope.showBookingForm) {
      $scope.showBookingFormToggle = false;
      $timeout(function () {
        $scope.showBookingFormToggle = true;
      }, 250);
    }
  };

})
;
