'use strict';

/*
 * Renders thumb icon + label based on percentage value
 *
 * USAGE
 * <span rating-thumb="{ value : 0.25, senders : 1}"></span> --> "25%"
 * <span rating-thumb="{ value : 0.25, senders : 9}"></span> --> "25%"
 * <span rating-thumb="{ value : 0.25, senders : 0}"></span> --> "no ratings"
 */

angular.module('ratingThumbDirective', [])

.directive('ratingThumb', function ($translate) {
  return {
    restrict: 'A',
    scope: {},
    template: '<span class="{{ colorClass }}" tooltip-html-unsafe="{{ tooltipHtml }}">' +
              '  <i class="{{ iconClass }}"></i>&nbsp;{{ label }}' +
              '</span>',
    link: function (scope, elm, attrs) {
      var options = scope.$parent.$eval(attrs.ratingThumb);
      var value   = options.value   || 0;
      var senders = options.senders || 0;

      if (senders === 0) {
        scope.label = '';
        scope.colorClass = 'text-muted';
        scope.iconClass = 'fa fa-thumbs-up';
      } else {
        if (value >= 0) {
          scope.label = Math.round(value * 100) + '%';
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
          scope.tooltipHtml = getTooltipHtml();
        }
      });

      function getTooltipHtml () {
        if (value === 0 || senders === 0) {
          return $translate.instant('RESOURCE.RATING.TOOLTIP_NORATING');
        }
        return '<i class=\'fa fa-2x fa-thumbs-up pull-left\' style=\'margin-right:10px\'></i>' +
               Math.round(value * 100) + '% ' + $translate.instant('RESOURCE.RATING.TOOLTIP_HTML');
      }

    }
  };
});
