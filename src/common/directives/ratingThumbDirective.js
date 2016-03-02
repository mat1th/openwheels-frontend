'use strict';

/*
 * Renders thumb icon + label based on percentage value
 *
 * USAGE
 * <span rating-thumb="{ value: null }"></span> --> no ratings
 * <span rating-thumb="{ value: 0 }"></span> --> 0% satisfied
 * <span rating-thumb="{ value: 0.5 }"></span> --> 50% satisfied
 */

angular.module('ratingThumbDirective', [])

.directive('ratingThumb', function ($translate) {
  return {
    restrict: 'A',
    scope: {},
    template: '<span class="{{ colorClass }}" uib-tooltip-html="tooltipHtml">' +
              '  <i class="{{ iconClass }}"></i>&nbsp;{{ label }}' +
              '</span>',
    link: function (scope, elm, attrs) {
      var options = scope.$parent.$eval(attrs.ratingThumb);
      var value = options.value;

      /* sanitize to null or number */
      value = angular.isNumber(value) ? value : null;

      /* maintain compatiblity (always show neutral thumb if no senders, regardless of value) */
      if (options.senders === null || options.senders === 0) {
        value = null;
      }

      if (value === null || value < 0) {
        scope.label = '';
        scope.colorClass = 'text-muted';
        scope.iconClass = 'fa fa-thumbs-up';
      }
      else {
        scope.label = Math.round(value * 100) + '%';

        if (value >= 0) {
          scope.colorClass = 'text-danger';
          scope.iconClass = 'fa fa-thumbs-down';
        }
        if (value > 0.3) {
          scope.colorClass = 'text-warning';
          scope.iconClass = 'fa fa-thumbs-up';
        }
        if (value > 0.65) {
          scope.colorClass = 'text-success';
          scope.iconClass = 'fa fa-thumbs-up';
        }
      }

      // reset tooltip when language changes
      scope.$watch(function () {
        return $translate.use();
      }, function (lang) {
        if (lang) {
          scope.tooltipHtml = createTooltipHtml();
        }
      });

      function createTooltipHtml () {
        if (value === null) {
          return $translate.instant('RESOURCE.RATING.TOOLTIP_NORATING');
        }
        return '<i class=\'fa fa-2x fa-thumbs-up pull-left\' style=\'margin-right:10px\'></i>' +
               Math.round(value * 100) + '% ' + $translate.instant('RESOURCE.RATING.TOOLTIP_HTML');
      }

    }
  };
});
