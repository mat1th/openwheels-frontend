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
      $uibModal,
      $filter,
      $anchorScroll,
      appConfig,
      Geocoder,
      alertService,
      resourceService,
      resourceQueryService,
      user,
      place
  ) {

    var DEFAULT_LOCATION = {
      // Utrecht, The Netherlands
      latitude : 52.091667,
      longitude: 5.117778000000044
    };

    var query = resourceQueryService.data;

    var results_per_page = 20;
    var max_pages = 10;

    $scope.searching = false;
    $scope.place = place;
    $scope.booking = {};
    $scope.resources = [];
    $scope.searchText = '';

    // set pagination variables
    resetPaginationCache();

    $scope.completePlacesOptions = {
      country: $filter('translateOrDefault')('SEARCH_COUNTRY', 'nl'),
      watchEnter: true
    };

    $scope.filters = {
      props: {
        radius: undefined
      },
      filters: {},
      options: {
        'airconditioning'    : false,
        'fietsendrager'      : false,
        'winterbanden'       : false,
        'kinderzitje'        : false,
        'navigatie'          : false,
        'trekhaak'           : false,
        'automaat'           : false,
        'mp3-aansluiting'    : false,
        'rolstoelvriendelijk': false
      }
    };

    init();

    function init () {
      if (query.timeFrame) {
        $scope.booking.beginRequested = query.timeFrame.startDate;
        $scope.booking.endRequested   = query.timeFrame.endDate;
      }

      if (query.radius) {
        $scope.filters.props.radius = query.radius;
      }

      if (query.page) {
        $scope.page = query.page;
      }

      if (query.options) {
        query.options.forEach(function (key) {
          $scope.filters.options[key] = true;
        });
      }

      if (query.filters) {
        $scope.filters.filters = query.filters;
      }

      if (place) {
        resourceQueryService.setLocation({
          latitude: place.latitude,
          longitude: place.longitude
        });
      }

      $scope.searchText = query.text;
      doSearch(true, query.page, undefined, true);
    }

    // get search result for page(s)
    // if gotoStartPage is true the searchresults will be displayed once 
    // the request is finished. The loader/spinner will be shown.
    // If gotoStartPage is empty no GUI changes are made, this is useful when 
    // we want to cache results in the background
    function doSearch (isInitialSearch, startPage, numberOfPages, gotoStartPage) {
      // ensure backward compatatibility, define default values for new params
      if(startPage === undefined) {
        startPage = 1;
      }
      if(numberOfPages === undefined) {
        numberOfPages = 2;
      }
      if(gotoStartPage === undefined) {
        gotoStartPage = true;
      }

      // are requested pages legal?
      if(startPage > max_pages) {
        startPage = max_pages;
      }
      if(startPage+numberOfPages > max_pages) {
        numberOfPages = max_pages - startPage + 1;
      }

      // time frame
      resourceQueryService.setTimeFrame({
        startDate: $scope.booking.beginRequested,
        endDate  : $scope.booking.endRequested
      });

      // radius
      resourceQueryService.setRadius($scope.filters.props.radius);

      // options
      var optionsArray = Object.keys($scope.filters.options).filter(function(e) { return $scope.filters.options[e]; });
      resourceQueryService.setOptions(optionsArray);

      // filters
      var filtersObject = $scope.filters.filters;
      resourceQueryService.setFilters(filtersObject);

      // construct api call
      var params = {};
      // calculate offset
      params.maxresults = numberOfPages * results_per_page;
      params.offset = (startPage - 1) * results_per_page;
      if (query.location)  { params.location  = query.location;  }
      if (query.timeFrame) { params.timeFrame = query.timeFrame; }
      if (query.radius)    { params.radius    = query.radius; }
      if (query.options)   { params.options   = query.options; }
      if (query.filters)   { params.filters   = query.filters; }
      if (!params.location) {
        if (user.isAuthenticated) {
          params.person = user.identity.id;
        } else {
          params.location = DEFAULT_LOCATION;
        }
      }

      // we only want to show spinner/loader when the user is waiting for
      // the results. This function is sometimes called to cache the next page,
      // in that case we do not want to show the spinner.
      if(gotoStartPage) {
        // perform search
        alertService.load();
        $scope.searching = true;
      }
      return resourceService.searchV2(params).then(function (resources) {
        // if there are less results than expected, the last page
        // is not equal to the max_page. Calculate and update last_pag
        if(resources.length < 1) {
          $scope.last_page = startPage - 1;
        }
        else if(resources.length < numberOfPages * results_per_page) {
          $scope.last_page = startPage + Math.ceil(resources.length / results_per_page) - 1;
        }

        // cache results
        for(var i = 0; i < numberOfPages; i++) {
          $scope.pagedResults[startPage + i] = resources.slice((i) * results_per_page, (i+1) * results_per_page);
        }

        // if needed, update UI
        if(gotoStartPage) {
          $scope.showPage(startPage);
        }
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

    $scope.showPage = function(page) {
      // check page is legal value
      if(page < 1) {
        page = 1;
      }
      if(page > max_pages) {
        page = max_pages;
      }

      // update url
      $scope.page = page;
      resourceQueryService.setPage(page);
      updateUrl();

      if(page > 1) {
        $anchorScroll('topsearch');
      }

      // page can be cached or not
      if($scope.pagedResults[page] !== undefined) { // Hooray, page is already in cache
        $scope.resources = $scope.pagedResults[page];
      } else { // Snap, page is not in cache, get it and show immediately
        doSearch(false, page, 2, true);
      }

      // if next page is not in cache, cache it
      var cachedPages = Object.keys($scope.pagedResults);
      if(cachedPages.indexOf(page + 1) < 0) { // next page not in cache, cache it!
        // doSearch might block loop, so do it in background;
        setTimeout(function() {doSearch(false, page + 1, 1, false);}, 0);
      }
    };


    //select timeframe modal
    $scope.selectTimeframe = function () {
      $uibModal.open({
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
      $uibModal.open({
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
      resetPaginationCache();
      doSearch();
    };

    function resetPaginationCache() {
      // pagination variables
      $scope.page = 1; // current page
      $scope.last_page = max_pages;
      $scope.pagedResults = {};
    }

    $scope.$watch('placeDetails', function (newVal, oldVal) {
      if (!newVal || (newVal === oldVal)) {
        return;
      }
      resourceQueryService.setLocation({
        latitude : newVal.geometry.location.lat(),
        longitude: newVal.geometry.location.lng()
      });
      resourceQueryService.setText(newVal.formatted_address);
      return doSearch();
    });

    $scope.removeTimeframe = function () {
      $scope.booking.beginRequested = null;
      $scope.booking.endRequested = null;
      return doSearch();
    };

    function updateUrl () {
      $location.search(resourceQueryService.createStateParams());
    }

    $scope.toggleMap = function toggleMap(){
      if(! $state.includes('^.map')){
        $state.go('^.map').then(updateUrl);
      }else{
        $state.go('^.list').then(updateUrl);
      }
    };

    $scope.selectResource = function (resource) {
      var params = resourceQueryService.createStateParams();
      params.resourceId = resource.id;
      params.city = resource.city;
      $state.go('owm.resource.show', params);
    };

  });
