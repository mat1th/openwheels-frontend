'use strict';

angular.module('owm.translate', [])

.config(function ($translateProvider, VERSION) {
  $translateProvider.useLoader('brandedFileLoader', {
    prefix: 'assets/locale/',
    suffix: '.json?v=' + VERSION
  });
  $translateProvider.preferredLanguage('nl_NL');
  $translateProvider.useLocalStorage();
})

.run(function($window) {
  //set moment lang
  $window.moment.lang('nl');
})

;
