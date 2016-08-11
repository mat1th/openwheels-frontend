'use strict';

angular.module('owm.person.intro', [])

.controller('PersonIntroController', function ($scope, me, resourceService, $state) {
  activate();

  function activate() {
    $scope.openboxes = {};
    $scope.me = me;
    loadFeaturedSlider();
  }

  $scope.toggleBox = function(box) {
    if(!$scope.openboxes[box]) {
      $scope.openboxes[box] = true;
    } else {
      $scope.openboxes[box] = !$scope.openboxes[box];
    }
  };

  function loadFeaturedSlider() {
    resourceService.all({
      'onlyFeatured': 'true'
    })
    .then(function (res) {
      $scope.resources_slider = res;
    });
    $scope.gotoProfile = function (resource) {
      $state.go('owm.resource.show', {
        city: resource.city,
        resourceId: resource.id
      });
    };
  }
});
