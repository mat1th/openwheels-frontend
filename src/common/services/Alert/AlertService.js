'use strict';

angular.module('alertService', [])

.factory('alertService', function($rootScope, $timeout, $translate) {
  var alertService = {};
  var loadersByScope = {};

  // create an array of alerts available globally
  $rootScope.alerts = [];
  $rootScope.loader = null;

  // loading route message
  $rootScope.$on('$stateChangeSuccess', function () {
    alertService.loaded();
  });

  alertService.load = function(scope, type, msg) {
    var scopeKey = 'scope_' + (scope ? scope.$id : $rootScope.$id);
    loadersByScope[scopeKey] = { type: type, msg: msg };

    /* show the first loader */
    $rootScope.loader = loadersByScope[Object.keys(loadersByScope)[0]];
  };

  alertService.loaded = function(scope) {
    var scopeKey = 'scope_' + (scope ? scope.$id : $rootScope.$id);
    if (scopeKey in loadersByScope) {
      delete loadersByScope[scopeKey];
    }
    $rootScope.loader = loadersByScope[Object.keys(loadersByScope)[0]];
  };

  alertService.add = function(type, msg, timeout) {
    $rootScope.alerts.push({'type': type, 'msg': msg});
    if(timeout) {
      $timeout(function() {
        alertService.closeAlert( $rootScope.alerts.length-1 );
      }, timeout);
    }
  };

  alertService.addError = function (err) {
    var level   = err.level   || 'danger';
    var message = err.message || $translate.instant('GLOBAL.MESSAGE.GENERIC_ERROR');
    alertService.add(level, message, 8000);
  };

  alertService.addSaveSuccess = function () {
    alertService.add('success', $translate.instant('GLOBAL.MESSAGE.SAVE_SUCCESS'), 3000);
  };

  alertService.addGenericError = function () {
    alertService.add('danger', $translate.instant('GLOBAL.MESSAGE.GENERIC_ERROR'), 8000);
  };

  alertService.closeAlert = function(index) {
    $rootScope.alerts.splice(index, 1);
  };

  alertService.closeAll = function() {
    $rootScope.alerts = [];
  };

  return alertService;
})

;
