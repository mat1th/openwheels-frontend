/*!
 * Custom Loader for Angular Translate that loads the customized file from the branding directory
 */
'use strict';
angular.module('brandedFileLoader', []).factory('brandedFileLoader', [
  '$rootScope',
  '$q',
  '$http',
  function ($rootScope, $q, $http) {
    return function (options) {
      if (!options || (!angular.isString(options.prefix) || !angular.isString(options.suffix))) {
        throw new Error('Couldn\'t load static files, no prefix or suffix specified!');
      }
      var deferred = $q.defer();

      deferred.promise.then(function () {
        $rootScope.isLanguageLoaded = true;
      });

      $http({
        url: [
          options.prefix,
          options.key,
          options.suffix
        ].join(''),
        method: 'GET',
        params: ''
      }).then(function (locale) {
        $http({
          url: [
            'branding/locale/',
            options.key,
            options.suffix
          ].join(''),
          method: 'GET',
          params: ''
        }).then(
          function (brandedLocale){
            deferred.resolve(angular.extend(locale.data, brandedLocale.data));
          },
          function(){
            deferred.resolve(locale.data);
          }
        );
      },
      function (data) {
        deferred.reject(options.key);
      });
      return deferred.promise;
    };
  }
]);
