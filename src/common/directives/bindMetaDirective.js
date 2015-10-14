'use strict';

angular.module('bindMetaDirective', [])

.directive('bindMeta', function ($log, appConfig, metaInfoService) {
  return {
    restrict: 'A',
    scope: {
      attr: '@bindMetaAttr',
      prop: '@bindMetaProp'
    },
    link: function (scope, elm) {
      metaInfoService.register(elm, scope.attr, scope.prop);
    }
  };
});
