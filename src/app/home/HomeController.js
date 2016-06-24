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
    //resourceService.all({onlyFeatured: true}) //API CALL NEEDS TO BE FIXED FIRST, EMPTY RESULT SET
    resourceService.searchV2({maxresults: 20})
    .then(function(res) {
      $scope.resources_slider = res;
    });
    $scope.gotoProfile = function(resource) {
      $state.go('owm.resource.show', {city: resource.city, resourceId: resource.id});
    };
  }

  $scope.howToRent = 'https://mywheels.nl/autodelen/hoe-huren-werkt';
  $scope.howToLet = 'https://mywheels.nl/autodelen/hoe-verhuren-werkt';
  $scope.howToCarsharing = 'https://mywheels.nl/autodelen';
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

  $scope.imageStyle1 = { 'background-image': 'url(\'branding/img/home-rotate-1.jpg\')' };
  $scope.imageStyle2 = { 'background-image': 'url(\'branding/img/home-rotate-2.jpg\')' };
  $scope.imageStyle3 = { 'background-image': 'url(\'branding/img/home-rotate-3.jpg\')' };

  $scope.version = VERSION;
})
;
