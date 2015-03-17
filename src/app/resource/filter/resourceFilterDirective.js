'use strict';

angular.module('owm.resource.filterDirective', [])

/**
 * Wrapper for using the filters controller & -template as a directive
 */
.directive('resourceFilter', function ($controller, $timeout) {
  return {
    restrict: 'EA',
    scope: {
      onChange: '=',
      props  : '=',
      filters: '=',
      options: '='
    },
    templateUrl: 'resource/filter/resource-filter-form.tpl.html',
    link: function (scope, elm, attrs) {

      var modalInstanceStub = {
        close: angular.noop,
        dismiss: angular.noop
      };

      var locals = {
        $scope: scope,
        $modalInstance: modalInstanceStub,
        props  : scope.props,
        filters: scope.filters,
        options: scope.options
      };

      var onChange = scope.onChange || angular.noop;

      $controller('ResourceFilterController', locals);

      scope.$watch('props', function (newValue, oldValue) {
        if (newValue !== oldValue) { onChange(); }
      }, true);

      scope.$watch('filters', function (newValue, oldValue) {
        if (newValue !== oldValue) { onChange(); }
      }, true);

      scope.$watch('options', function (newValue, oldValue) {
        if (newValue !== oldValue) { onChange(); }
      }, true);

    }
  };
})
;
