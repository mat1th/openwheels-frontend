'use strict';

angular.module('badgeListDirective', [])

.directive('badgeList', function ($translate) {
  return {
    restrict: 'A',
    scope   : {},
    replace : true,
    template: '<span uib-tooltip="{{ \'BADGES_TOOLTIP\' | translate }}">' +
              '  <span ng-repeat="badge in badges">' +
              '    <img class="img-badge" ng-if="badge.imageUrl" ng-src="{{ badge.imageUrl }}" alt="{{ badge.name }}" title="{{ badge.name }}" />' +
              '    <span class="tag" ng-if="!badge.imageUrl" ng-bind="badge.name"></span>' +
              '  </span>' +
              '</span>',

    link: function (scope, elm, attrs) {
      scope.badges = scope.$parent.$eval(attrs.badgeList);
    }
  };
});
