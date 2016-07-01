'use strict';

/*
 * Renders thumb icon based on binary value
 *
 * USAGE
 * <span rating-thumb-binary="{ value : 1 | true  }"></span> --> positive
 * <span rating-thumb-binary="{ value : null      }"></span> --> neutral
 * <span rating-thumb-binary="{ value : 0 | false }"></span> --> negative
 */

angular.module('ratingThumbBinaryDirective', [])

.directive('ratingThumbBinary', function () {
  return {
    restrict: 'A',
    scope: {},
    template: '<md-icon class="{{ colorClass }} material-icons small" style="font-size:16px; line-height:1.42857143;">{{ iconClass }}</md-icon>',
    link: function (scope, elm, attrs) {
      var options = scope.$parent.$eval(attrs.ratingThumbBinary);
      var value   = options.value;
      var size    = options.size || '';

      if (value === 1 || value === true) {
        // positive
        scope.colorClass = 'text-success';
        scope.iconClass = 'thumb_up' + size;
      }
      else if (value === null) {
        // neutral
        scope.colorClass = 'text-muted';
        scope.iconClass = 'thumb_up';
      }
      else if (value === 0 || value === false) {
        // negative
        scope.colorClass = 'text-danger';
        scope.iconClass = 'thumb_down';
      }
      else {
        // error state
        scope.colorClass = 'text-muted';
        scope.iconClass = 'thumb up';
      }

    }
  };
});
