'use strict';

angular.module('personDirectives', [])

.directive('personProfileImage', ['$log', 'appConfig', function ($log, appConfig) {

  var cacheId = 0;

  return {
    restrict: 'A',
    scope: {},
    link: function (scope, elm, attrs) {
      var options = scope.$parent.$eval(attrs.personProfileImage);

      var person = options.person  || null;
      var size   = options.size    || 'small';
      var noCache= options.noCache || false;
      var w, h, src;

      if (person) {
        switch (size) {
          case 'small':
          case 'square':
            w = 50;
            h = 50;
            break;
          case 'normal':
            w = 72;
            h = 72;
            break;
          default:
            w = 50;
            h = 50;
        }
        src = appConfig.serverUrl + '/person' +
          '/' + person.id +
          '/' + w +
          '/' + h +
          '/profile.png' +
          (noCache ? '?nocache=' + (++cacheId).toString() : '');

        elm.attr('src', src);
      }
    }
  };
}]);
