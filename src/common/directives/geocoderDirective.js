'use strict';

angular.module('geocoderDirective', [])

.directive('owGeocoder', function ($compile, $filter) {
  return {
    restrict: 'A',
    link: function (scope, elm, attrs) {
      var options = scope.$eval(attrs.owGeocoder);
      var onDetailsCallback = options.onDetails || angular.noop;

      scope.placeDetails = null;

      scope.completePlacesOptions = {
        country   : $filter('translateOrDefault')('SEARCH_COUNTRY', 'nl'),
        watchEnter: true
      };

      scope.$watch('placeDetails', function (newVal, oldVal) {
        if (!newVal || (newVal === oldVal)) {
          return;
        }
        onDetailsCallback(newVal);
      });

      elm.removeAttr('ow-geocoder');
      elm.attr('ng-autocomplete', '');
      elm.attr('details', 'placeDetails');
      elm.attr('options', 'completePlacesOptions');

      $compile(elm)(scope, function (clone) {
        elm.replaceWith(clone);
      });
    }
  };
})
;
