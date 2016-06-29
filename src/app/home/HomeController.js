'use strict';

angular.module('owm.home', ['owm.resource', 'slick'])

.controller('HomeController', function ($scope, $translate, resourceQueryService, $state, VERSION, resourceService) {

  $scope.$watch(function () {
    return $translate.use();
  }, function (lang) {
    if (lang) {
      $scope.lang = lang;
    }
  });

  if($scope.features.featuredSlider) {
    resourceService.all({'onlyFeatured': 'true'})
    .then(function(res) {
      $scope.resources_slider = res;
    });
    $scope.gotoProfile = function(resource) {
      $state.go('owm.resource.show', {city: resource.city, resourceId: resource.id});
    };
  }

  $scope.search = { text: '' };

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

  $scope.version = VERSION;
})
;
