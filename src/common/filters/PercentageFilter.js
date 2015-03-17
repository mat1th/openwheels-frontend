'use strict';

/**
 * source: https://github.com/vpegado/angular-percentage-filter
 */

angular.module('filters.percentage', [])
.filter('percentage', function ($window) {
  return function (input, decimals, suffix) {
    var value = input || 0;
    decimals = angular.isNumber(decimals) ? decimals :  3;
    suffix = suffix || '%';
    return Math.round(value * Math.pow(10, decimals + 2)) / Math.pow(10, decimals) + suffix;
  };
});
