'use strict';

angular.module('geocoderDirective', [])

.directive('owGeocoderSearchbar', function ($compile, $filter) {
  return {
    restrict: 'E',
    templateUrl: 'directives/geocoderDirectiveSearchbar.tpl.html',
    link: function (scope, elm, attrs) {

    }
  };
})
;
