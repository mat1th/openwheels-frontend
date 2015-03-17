'use strict';

angular.module('owm.resource.search', [
  'owm.resource.search.list',
  'owm.resource.search.map'
])

  .controller('ResourceSearchController', function (
      $location,
      $scope,
      $state,
      $stateParams,
      $modal,
      $translate,
      $filter,
      appConfig,
      Geocoder,
      alertService,
      resourceService,
      resourceQueryService,
      user
  ) {

    $scope.searching = false;

    var DEFAULT_LOCATION = {
      // Utrecht, The Netherlands
      latitude : 52.091667,
      longitude: 5.117778000000044
    };

    var query = {
      text     : null,
      location : null,
      timeFrame: null
    };

    $scope.booking = {};
    $scope.resources = [];
    $scope.place = '';

    $scope.completePlacesOptions = {
      country: appConfig.placesCountry,
      watchEnter: true
    };

    $scope.filters = {
      props: {
        radius: undefined
      },
      filters: {
        minSeats: $stateParams.minseats || -1,
        locktype: $stateParams.locktype || '',
        fuelType: $stateParams.fueltype || '',
        resourceType: $stateParams.resourcetype || ''
      },
      options: {
        'airconditioning': $stateParams.airconditioning || false,
        'fietsendrager': $stateParams.fietsendrager || false,
        'winterbanden': $stateParams.winterbanden || false,
        'kinderzitje': $stateParams.kinderzitje || false,
        'navigatie': $stateParams.navigatie || false,
        'trekhaak': $stateParams.trekhaak || false,
        'automaat': $stateParams.automaat || false,
        'mp3-aansluiting': $stateParams.mp3 || false,
        'rolstoelvriendelijk': $stateParams.rolstoelvriendelijk || false
      }
    };

    init();

    function init () {
      query.text      = resourceQueryService.getText();
      query.location  = resourceQueryService.getLocation();
      query.timeFrame = resourceQueryService.getTimeFrame();
      query.radius    = resourceQueryService.getRadius();

      if (query.timeFrame) {
        $scope.booking.beginRequested = query.timeFrame.startDate;
        $scope.booking.endRequested   = query.timeFrame.endDate;
      }

      if (query.radius) {
        $scope.filters.props.radius = query.radius;
      }

      $scope.place = query.text;

      doSearch();
    }

    function doSearch () {
      if ($scope.booking.beginRequested && $scope.booking.endRequested) {
        query.timeFrame = {
          startDate: $scope.booking.beginRequested,
          endDate  : $scope.booking.endRequested
        };
      } else {
        query.timeFrame = null;
      }
      query.radius = $scope.filters.props.radius;

      saveQuery();

      var params = {};
      if (query.location) { params.location = query.location;  }
      if (query.timeFrame) { params.timeFrame = query.timeFrame; }
      if (query.radius) { params.radius = query.radius; }

      if (!params.location) {
        if (user.isAuthenticated) {
          params.person = user.identity.id;
        } else {
          params.location = DEFAULT_LOCATION;
        }
      }
      params.options = Object.keys($scope.filters.options).filter(function(e) { return $scope.filters.options[e]; });
      params.filters = $scope.filters.filters;

      alertService.load();
      $scope.searching = true;
      return resourceService.search(params).then(function (resources) {
        $scope.resources = resources;
        return resources;
      })
      .catch(function (err) {
        alertService.addError(err);
      })
      .finally(function () {
        $scope.searching = false;
        alertService.loaded();
      });
    }

    //select timeframe modal
    $scope.selectTimeframe = function () {
      $modal.open({
        templateUrl: 'booking/timeframe/booking-timeframe-modal.tpl.html',
        controller: 'BookingTimeframeController',
        resolve: {
          booking: function () {
            return angular.copy($scope.booking);
          }
        }
      }).result.then(function (booking) {
          $scope.booking = booking;
          return doSearch();
        });
    };

    $scope.removeTimeframe = function () {
      $scope.booking.beginRequested = null;
      $scope.booking.endRequested = null;
      return doSearch();
    };

    //select filters modal
    $scope.setFilters = function () {
      $modal.open({
        templateUrl: 'resource/filter/resource-filter-modal.tpl.html',
        controller: 'ResourceFilterController',
        resolve: {
          props: function ( ){
            return $scope.filters.props;
          },
          filters: function () {
            return $scope.filters.filters;
          },
          options: function () {
            return $scope.filters.options;
          }
        }
      }).result.then(function (selected) {
          $scope.filters.props   = selected.props;
          $scope.filters.filters = selected.filters;
          $scope.filters.options = selected.options;
          return doSearch();
        });
    };

    $scope.sidebarFiltersChanged = function () {
      doSearch();
    };

    $scope.$watch('placeDetails', function (newVal, oldVal) {
      if (!newVal || (newVal === oldVal)) {
        return;
      }
      query.location = {
        latitude : newVal.geometry.location.lat(),
        longitude: newVal.geometry.location.lng()
      };
      query.text = newVal.formatted_address;
      return doSearch();
    });

    $scope.removeTimeframe = function () {
      $scope.booking.beginRequested = null;
      $scope.booking.endRequested = null;
      return doSearch();
    };

    function saveQuery () {
      resourceQueryService.setText(query.text);
      resourceQueryService.setLocation(query.location);
      resourceQueryService.setTimeFrame(query.timeFrame);
      resourceQueryService.setRadius(query.radius);
      $location.search(resourceQueryService.createStateParams());
    }

    $scope.toggleMap = function toggleMap(){
      if(! $state.includes('^.map')){
        $state.go('^.map').then(saveQuery);
      }else{
        $state.go('^.list').then(saveQuery);
      }
    };

    $scope.selectResource = function (resource) {
      var params = resourceQueryService.createStateParams();
      params.resourceId = resource.id;
      $state.go('owm.resource.show', params);
    };

  });
