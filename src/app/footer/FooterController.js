'use strict';

angular.module('owm.footer', [])

.controller('FooterController', function ($scope, $window, $translate) {
  $scope.currentLanguage = function() {
    return $translate.use();
  };

  // $translate.use('nl_NL');

  $scope.changeLanguage = function (langKey) {
    $translate.use(langKey);
    //set moment lang
    $window.moment.lang(langKey);
  };
})
;
