'use strict';

angular.module('windowSizeService', [])

/**
 * Sets the following variables on root scope (& keeps them updated on window resize):
 *
 * $rootScope.windowSize = 'XS' | 'SM' | 'MD' | 'LG'
 * $rootScope.isWindowSizeSM = true - if window size is at least SM
 * $rootScope.isWindowSizeMD = true - if window size is at least MD
 * $rootScope.isWindowSizeLG = true - if window size is at least LG
 *
 */
.factory('windowSizeService', function ($timeout, $rootScope, $window) {

  var DEBOUNCE_MS = 100;
  var debounceTimer;

  var XS = 480;
  var SM = 768;
  var MD = 992;
  var LG = 1200;

  update();

  $window.addEventListener('resize', function () {
    $timeout.cancel(debounceTimer);
    debounceTimer = $timeout(function () {
      update();
    }, DEBOUNCE_MS);
  });

  function update () {
    var w = $window.innerWidth;

    $rootScope.isWindowSizeXS = false;
    $rootScope.isWindowSizeSM = false;
    $rootScope.isWindowSizeMD = false;
    $rootScope.isWindowSizeLG = false;

    if (w >= XS) {
      $rootScope.isWindowSizeXS = true;
    }

    if (w >= SM) {
      $rootScope.isWindowSizeSM = true;
    }

    if (w >= MD) {
      $rootScope.isWindowSizeMD = true;
    }

    if (w >= LG) {
      $rootScope.isWindowSizeLG = true;
    }
  }

  return {};

});
