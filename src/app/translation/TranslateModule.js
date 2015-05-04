'use strict';

angular.module('owm.translate', [])

.config(function config($translateProvider) {
  $translateProvider.useLoader('brandedFileLoader', {
    prefix: 'assets/locale/',
    suffix: '.json'
  });
  $translateProvider.preferredLanguage('nl_NL');
  $translateProvider.useLocalStorage();
})

.run(function($window) {
  //set moment lang
  $window.moment.lang('nl');
})

;
