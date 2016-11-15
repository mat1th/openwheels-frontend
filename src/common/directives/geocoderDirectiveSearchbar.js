'use strict';

angular.module('geocoderDirective', ['geocoder'])

.directive('owGeocoderSearchbar', function ($compile, $filter) {
  return {
    restrict: 'E',
    templateUrl: 'directives/geocoderDirectiveSearchbar.tpl.html',
    controller: function($scope, Geocoder, resourceQueryService, $state) {
      $scope.search = {text: ''};
      $scope.placeDetails = null;
      $scope.searcher = {loading: false, error: false};

      $scope.doSearch = function() {
        if($scope.search.text === '') {
          return;
        }

        $scope.searcher.loading = true;

        return Geocoder.latLngForAddress($scope.search.text)
        .then(function(res) {
          resourceQueryService.setText(res[0].address);
          resourceQueryService.setLocation({
            latitude: res[0].latlng.latitude,
            longitude: res[0].latlng.longitude
          });
          $state.go('owm.resource.search.list', resourceQueryService.createStateParams());
        })
        .catch(function(err) {
          $scope.searcher.error = true;
        });
      };

      $scope.$watch('placeDetails', function (newVal, oldVal) {
        if (!newVal || (newVal === oldVal)) {
          return;
        }
        if ($scope.placeDetails) {
          resourceQueryService.setText($scope.search.text);
          resourceQueryService.setLocation({
            latitude: $scope.placeDetails.geometry.location.lat(),
            longitude: $scope.placeDetails.geometry.location.lng()
          });
        }
        $state.go('owm.resource.search.list', resourceQueryService.createStateParams());
      });

      $scope.options = {
        watchEnter: true,
        country   : $filter('translateOrDefault')('SEARCH_COUNTRY', 'nl'),
        types   : 'geocode',
      };

    },
  };
})
;
