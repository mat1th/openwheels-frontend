'use strict';

angular.module('resourceCarouselDirective', [])

.directive('resourceCarousel', function ($translate, appConfig) {
  return {
    restrict: 'A',
    scope   : {
      resource: '=resourceCarousel'
    },
    template: '<carousel>' +
              '  <slide ng-repeat="image in images">' +
              '    <img style="margin:auto" ng-src="{{ image.url }}" />' +
              '  </slide>' +
              '</carousel>',
    link: function (scope, elm, attrs) {

      scope.images = [];

      angular.forEach(scope.resource.pictures, function (picture) {
        var path = picture.large || picture.normal || picture.small || null;
        if (path) {
          scope.images.push({ url: appConfig.serverUrl + '/' + path });
        }
      });

      if (scope.images.length === 0) {
        scope.images.push({ url: 'assets/img/resource-avatar-large.jpg' });
      }
    }
  };
});
