'use strict';

angular.module('timeframe', [])

  .constant('timeframeConfig', {})
  .directive('timeframe', function (timeframeConfig, API_DATE_FORMAT) {
    var options = {};
    angular.extend(options, timeframeConfig);

    return {
      restrict: 'EA',
      scope: {
        begin: '=',
        end: '='
      },
      //require: '?ngModel',
      link: function($scope, $element, attrs) {
        var modelFormat = API_DATE_FORMAT;
        var getOptions = function () {
          return angular.extend({}, timeframeConfig, $scope.$eval(attrs.timeframe));
        };
        var initTimeframe = function() {
          // console.log($scope);
        };
        var setBegin = function(end) {
          if(!end) {
            $scope.begin = moment().format(modelFormat);
          } else if(!end.isValid()) {
            return;
          } else {
            $scope.begin = end.subtract('hours', 6).format(modelFormat);
          }
        };

        var setEnd = function(begin) {
          if(!begin.isValid()){
            return;
          }

          /* #MW-1782: end time should not automagically jump to next day */
          var midnight = moment().startOf('day').add(1, 'days');
          var sixHoursLater = begin.clone().add(6, 'hours');
          if (begin.isBefore(midnight) && sixHoursLater.isAfter(midnight)) {
            $scope.end = begin.clone().add(30, 'minutes').format(modelFormat);
          } else {
            $scope.end = sixHoursLater.format(modelFormat);
          }
        };

        var timeframeChanged = function(timeframeNew, timeframeOld) {
          var begin = timeframeNew[0] ? moment(timeframeNew[0]) : null;
          var end = timeframeNew[1] ? moment(timeframeNew[1]) : null;
          var beginChanged = (timeframeNew[0] !== timeframeOld[0]);
          var endChanged = (timeframeNew[1] !== timeframeOld[1]);
          if(begin && !end) {
            setEnd(begin);
          }
          else if(!begin && end) {
            setBegin(end);
          }
          else if(beginChanged && begin > end) {
            setEnd(begin);
          }
          else if(endChanged && begin > end) {
            setBegin(end);
          }
        };
        $scope.$watch(getOptions, initTimeframe, true);
        $scope.$watch('[begin, end]', timeframeChanged, true);
      }
    };

  })
;
