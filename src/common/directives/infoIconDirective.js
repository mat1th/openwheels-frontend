'use strict';

angular.module('infoIconDirective', [])

/**
 *
 * usage examples:
 * <info-icon tooltip-html="'I'm the tooltip'"></info-icon>
 * <info-icon tooltip-html="'TRANSLATE_KEY' | translate"></info-icon>
 */
.directive('infoIcon', function () {
  return {
    restrict: 'E',
    scope: true,
    replace: true,
    template: '<i ng-show="tooltipHtml" class="info-icon fa fa-info-circle text-info" tooltip-html-unsafe="{{ tooltipHtml }}"></i>',
    link: function (scope, elm, attrs) {
      scope.$watch(attrs.tooltipHtml, function (tooltipHtml) {
        if (tooltipHtml) {
          scope.tooltipHtml = tooltipHtml;
        }
      });
    }
  };
})
;
