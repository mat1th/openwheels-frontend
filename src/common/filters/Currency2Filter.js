'use strict';

angular.module('filters.currency2', [])

.filter('currency2', function(numberFilter) {
  return function(input) {
    var neg = false;
    if(input < 0) {
      input *= -1;
      neg = true;
    }
    input = input || '';
    
    return '€ ' + ( neg ? '-' : '') + numberFilter(input, 2);
  };
});
