'use strict';

angular.module('filters.reverse', [])
  .filter('reverse', function () {
    return function (items) {
      return items.slice().reverse();
    };
  });
