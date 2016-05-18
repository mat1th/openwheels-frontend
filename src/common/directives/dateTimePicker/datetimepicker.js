'use strict';

angular.module('dateTimePicker', [])

.directive('dateTimePicker', function ($translate) {
  return {
    // restrict: 'A',
    scope: {},
    templateUrl:  'directives/dateTimePicker/dateTimePicker.tpl.html',
    link: function (scope, elm, attrs) {
      console.log('joi');

    }
  };
});
