'use strict';

angular.module('windowSizeService', [])

/**
 * Sets the following variables on root scope (& keeps them updated on window resize):
 *
 * $rootScope.windowSize = 'XS' | 'SM' | 'MD'
 * $rootScope.isWindowSizeSM = true - if window size is at least SM
 * $rootScope.isWindowSizeMD = true - if window size is at least MD
 *
 */
.factory('windowSizeService', function ($timeout, $rootScope, $window) {

  var UPDATE_INTERVAL_MS = 100;
  var timer;

  // use the same crossovers as bootstrap CSS
  var SM = 768;
  var MD = 992;

  update();
  $window.addEventListener('resize', update);

  function update () {
    $timeout.cancel(timer);
    timer = $timeout(function () {
      var w = $window.innerWidth;

      $rootScope.windowSize = 'XS';
      $rootScope.isWindowSizeSM = false;
      $rootScope.isWindowSizeMD = false;

      if (w >= SM) {
        $rootScope.windowSize = 'SM';
        $rootScope.isWindowSizeSM = true;
      }

      if (w >= MD) {
        $rootScope.windowSize = 'MD';
        $rootScope.isWindowSizeMD = true;
      }
    }, UPDATE_INTERVAL_MS);
  }

  return {};

});
