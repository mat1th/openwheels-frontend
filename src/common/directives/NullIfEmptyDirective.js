'use strict';
angular.module('nullIfEmpty', [])

.directive('nullIfEmpty', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attr, ctrl) {
      ctrl.$parsers.unshift(function(value) {
        return value === '' ? null : value;
      });
    }
  };
});
