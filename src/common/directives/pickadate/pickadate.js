'use strict';

angular.module('pickadate', [])

  .constant('pickadateConfig', {})
  .constant('pickatimeConfig', {})

  .directive('pickadate', function (pickadateConfig) {
    var options = {};
    angular.extend(options, pickadateConfig);

    return {
      restrict: 'EA',
      require: '?ngModel',
      scope: true,
      link: function($scope, $element, attrs, ngModel) {
        if (!ngModel) {
          return; // do nothing if no ng-model
        }
        var getOptions = function () {
          return angular.extend({
            container: 'body',

            /**
             * Workaround for issue "Picker doesn't open on iOS 8"
             * https://github.com/amsul/pickadate.js/issues/523
             */
            onOpen: function () {
              $element.blur();
            },
            onClose: function () {
              $element.blur();
            }
          }, pickadateConfig, $scope.$eval(attrs.pickadate));
        };

        var initPicker = function () {

          // Update the date picker when the model changes
          ngModel.$render = function () {
            if(!ngModel.$modelValue || !moment(ngModel.$modelValue).isValid() ) {
              return picker.clear();
            }
            var momentDate = moment(ngModel.$modelValue);
            return picker.set('select', momentDate.toDate() );
          };

          function parser(viewValue) {
            if(!viewValue) {
              return null;
            }
            var momentDate = moment(viewValue, opts.viewFormat);

            // Round down to nearest quarter-of-an-hour
            var getRoundedMoment = function() {
              var mom = moment();
              var quarter = Math.floor((mom.minutes() | 0) / 15); // returns 0, 1, 2 or 3
              var minutes = (quarter * 15) % 60;
              mom.minutes(minutes);
              return mom;
            };

            var momentModel = moment(ngModel.$modelValue, opts.modelFormat).isValid() ? moment(ngModel.$modelValue, opts.modelFormat) : getRoundedMoment();
            var formattedDate = momentModel.years( momentDate.years() ).months( momentDate.months() ).dates( momentDate.dates() ).format(opts.modelFormat);
            return formattedDate;
          }
          ngModel.$parsers.unshift(parser);

          function formatter(modelValue) {
            if( !modelValue || !moment(modelValue).isValid() ) {
              return null;
            }
            return moment(modelValue).format(opts.viewFormat);
          }
          ngModel.$formatters.unshift(formatter);

          var opts = getOptions();
          opts.onStart = function() {
            if(!ngModel.$viewValue || !moment(ngModel.$viewValue).isValid()) {
              return this.clear();
            }
            var momentDate = moment(ngModel.$viewValue);
            return this.set('select', momentDate.toDate() );
          };
          var picker = $element.pickadate(opts).pickadate('picker');


        };

        $scope.$watch(getOptions, initPicker, true);


      }
    };

  })

  .directive('pickatime', function (pickatimeConfig) {
    var options = {};
    angular.extend(options, pickatimeConfig);

    return {
      restrict: 'EA',
      scope: true,
      require: '?ngModel',
      link: function($scope, $element, attrs, ngModel) {
        if (!ngModel) {
          return; // do nothing if no ng-model
        }
        var getOptions = function () {
          return angular.extend({
            container: 'body',

            /**
             * Workaround for issue "Picker doesn't open on iOS 8"
             * https://github.com/amsul/pickadate.js/issues/523
             */
            onOpen: function () {
              $element.blur();
            },
            onClose: function () {
              $element.blur();
            }

          }, pickatimeConfig, $scope.$eval(attrs.pickatime));
        };

        var initPicker = function () {

          function parser(viewValue) {
            if(!viewValue) {
              return null;
            }
            var modelVal = ngModel.$modelValue;
            var momentModel = modelVal ? moment(modelVal, opts.modelFormat) : moment();
            var momentTime = moment(viewValue, opts.viewFormat);
            var formattedDate = momentModel.hours( momentTime.hours() ).minutes( momentTime.minutes() ).format(opts.modelFormat);
            return formattedDate;
          }
          ngModel.$parsers.unshift(parser);

          function formatter(modelValue) {
            if( !modelValue || !moment(modelValue).isValid() ) {
              return null;
            }
            return moment(modelValue).format(opts.viewFormat);
          }
          ngModel.$formatters.unshift(formatter);

          // Update the time picker when the model changes
          ngModel.$render = function () {
            if(!ngModel.$modelValue) {
              return picker.clear();
            }
            var momentTime = moment(ngModel.$modelValue, opts.modelFormat);
            return picker.set('select', [momentTime.hours(), momentTime.minutes()]);
          };

          var opts = getOptions();
          opts.onStart = function() {
            if(!ngModel.$viewValue) {
              return this.clear();
            }
            var momentDate = moment(ngModel.$viewValue);
            return this.set('select', [momentDate.hours(), momentDate.minutes()]);
          };
          var picker = $element.pickatime(opts).pickatime('picker');

        };

        $scope.$watch(getOptions, initPicker, true);

      }
    };

  })

;
