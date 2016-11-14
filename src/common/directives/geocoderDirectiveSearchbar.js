'use strict';

angular.module('geocoderDirective', [])

.directive('owGeocoderSearchbar', function ($compile, $filter) {
  return {
    restrict: 'E',
    templateUrl: 'directives/geocoderDirectiveSearchbar.tpl.html',
    controller: function($scope) {
      $scope.search = {text: ''};
    },
    link: function (scope, elm, attrs) {

      var onDetailsCallback = angular.noop;

      scope.placeDetails = null;

      scope.completePlacesOptions = {
        watchEnter: true,
        country   : $filter('translateOrDefault')('SEARCH_COUNTRY', 'nl'),
        types   : 'geocode',
      };

      scope.$watch('placeDetails', function (newVal, oldVal) {
        if (!newVal || (newVal === oldVal)) {
          return;
        }
        onDetailsCallback(newVal);
      });

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
