'use strict';

angular.module('owm.shell')

.controller('FooterController', function ($scope, $window, $translate) {
  $scope.currentLanguage = function() {
    return $translate.use();
  };

  $scope.changeLanguage = function (langKey) {
    $translate.use(langKey);
    $window.moment.lang(langKey);
  };
});
