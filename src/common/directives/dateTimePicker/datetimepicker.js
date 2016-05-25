'use strict';

angular.module('dateTimePicker', [])

.directive('dateTimePicker', function ($translate) {
  return {
    scope: {},
    templateUrl:  function (scope, elm, attrs) {
      return 'directives/dateTimePicker/dateTimePicker.tpl.html';
    },
    link: function (scope, elm, attrs) {
      // $scope.date = 'hio';
      console.log($scope.date);
      if (attrs.time === 'start'){
        scope.start = $translate.instant('DATE_START');
        scope.startTime = $translate.instant('TIME_START');
      }
      else if (attrs.time === 'end') {
        scope.start = $translate.instant('DATE_END');
        scope.startTime = $translate.instant('TIME_END');
      }
    }
  };
});
