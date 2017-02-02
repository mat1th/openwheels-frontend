'use strict';
angular.module('sameHeightDirective', [])
.directive('sameHeight', function ($window, $timeout) {
  var sameHeight = {
    restrict: 'A',
    groups: {},
    link: function (scope, element, attrs) {
      if(!scope.sameHeight) {
        scope.sameHeight = {
          groups: {}
        };
      }
      $timeout(getHighest); // make sure angular has proceeded the binding
      angular.element($window).bind('resize', getHighest);

      function getHighest() {
        if (!sameHeight.groups[attrs.sameHeight]) { // if not exists then create the group
          sameHeight.groups[attrs.sameHeight] = {
            height: 0,
            elems:[]
          };
        }
        sameHeight.groups[attrs.sameHeight].elems.push(element);
        if(sameHeight.groups[attrs.sameHeight].height < element.outerHeight()) {
          sameHeight.groups[attrs.sameHeight].height = element.outerHeight();
        }

        angular.forEach(sameHeight.groups[attrs.sameHeight].elems, function(elem){
          elem.css('height', sameHeight.groups[attrs.sameHeight].height);
        });
      }
    }
  };
  return sameHeight;
})
;
