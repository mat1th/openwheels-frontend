'use strict';
angular.module('bindingDirectives', [])

.directive('nullIfEmpty', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attr, ctrl) {
      ctrl.$parsers.unshift(function(value) {
        return value === '' ? null : value;
      });
    }
  };
})

.directive('bindFloat', function () {
  return {
    require: '?ngModel',
    link: function (scope, elm, attrs, ngModel) {
      if (!ngModel) { return; }

      ngModel.$parsers.unshift(function (value) {
        try {
          return parseFloat(value);
        }
        catch (e) {
          return 0;
        }
      });
    }
  };
})
;
