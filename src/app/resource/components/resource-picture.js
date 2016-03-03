(function () {
  'use strict';

  angular.module('owm.resource')

  .directive('owResourcePicture', function (appConfig) {
    return {
      restrict: 'E',
      template: '<img ng-src="{{ imageUrl }}">',
      scope: {
        resource: '='
      },
      link: function (scope, elm, attrs) {
        var resource = scope.resource;

        attrs.$observe('size', function (size) {
          if (!resource.pictures || !resource.pictures.length) {
            scope.imageUrl = defaultPicture(size);
            return;
          }

          if (resource.pictures[0][size]) {
            scope.imageUrl = appConfig.serverUrl + '/' + resource.pictures[0][size];
          }
        });

        function defaultPicture (size) {
          return 'assets/img/resource-avatar-' + size + '.jpg';
        }

      }
    };
  });

}());
