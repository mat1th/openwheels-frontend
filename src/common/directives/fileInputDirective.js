'use strict';

angular.module('fileInputDirective', [])

.directive('fileInput', function () {

  return {
    restrict: 'EA',
    template: '<input type="file" />',
    replace: true,
    scope: {
      onChange: '=',
    },
    link: function (scope, elm, attrs) {

      if (angular.isFunction(scope.onChange)) {
        elm.on('change', onChange);

        scope.$on('$destroy', function () {
          elm.off('change', onChange);
        });
      }

      function onChange (e) {
        scope.$apply(function () {
          scope.onChange(e.target.files[0]);
          elm.val('');
        });
      }
    }
  };
});
