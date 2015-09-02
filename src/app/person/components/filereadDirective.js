'use strict';

angular.module('owm.person.fileread', [])

.directive('fileread',function () {
  return {
    scope: {
      fileread: '='
    },
    link: function (scope, element, attributes) {
      element.bind('change', function (changeEvent) {
        scope.fileread = changeEvent.target.files[0];
      });
    }
  };
});
