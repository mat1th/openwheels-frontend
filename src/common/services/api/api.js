'use strict';

angular.module('api', [])

.config(function ($httpProvider) {
  $httpProvider.interceptors.push('apiErrorInterceptor');
})

.service('apiErrorInterceptor', function ($log, $injector, $q) {

  // try http replay, otherwise reject with original error
  this.responseError = function (originalError) {
    var api = $injector.get('api');
    if (originalError.status === 401 && api.canReplay(originalError.config)) {
      $log.debug('<!! HTTP 401, refresh token & replay');
      return api.replay(originalError.config).catch(function (replayError) {
        return $q.reject(originalError);
      });
    }
    return $q.reject(originalError);
  };
})

.factory('api', function ($log, $q, $http, $rootScope, appConfig, tokenService) {

  var AUTH_HEADER = 'X-Simple-Auth-Digest';
  var apiUrl = appConfig.serverUrl + '/api/';

  var defaultConfig = {
    url: apiUrl,
    headers: {
      'X-Ref'               : appConfig.appUrl,
      'X-Simple-Auth-App-Id': appConfig.appId
    }
  };

  var api = {};

  api.createRpcMethod = function (rpcMethod, isAnonymousMethod) {
    return function (rpcParams, multiPartParams) {
      return api.invokeRpcMethod(rpcMethod, rpcParams, multiPartParams, isAnonymousMethod);
    };
  };

  api.invokeRpcMethod = function (rpcMethod, rpcParams, multiPartParams, isAnonymousMethod) {
    var http;
    var token;
    var config = angular.copy(defaultConfig);
    config.isAnonymousMethod = !!isAnonymousMethod;
    config.method = 'POST';
    config.data = {
      jsonrpc: '2.0',
      id     : 0,
      method : rpcMethod
    };

    if (rpcParams) {
      config.data.params = rpcParams;
    }
    if (multiPartParams) {
      config = configAsMultipart(config, multiPartParams);
    }

    token = tokenService.getToken();
    if (token && token.tokenType) {
      config.headers[AUTH_HEADER] = createAuthHeader(token);
    }

    http = $http(config).then(handleRpcResponse);
    http.catch(catchAll);
    return http;
  };

  // check if http request can be replayed
  api.canReplay = function (config) {
    return config.url === apiUrl && !config.isReplay;
  };

  // refresh token & replay http request
  api.replay = function (config) {
    var token = tokenService.getToken();
    if (!token) {
      return $q.reject('no token');
    }
    return token.refresh().then(function (freshToken) {
      var replayConfig = angular.copy(config);
      replayConfig.isReplay = true;
      replayConfig.headers[AUTH_HEADER] = createAuthHeader(freshToken);
      return $http(replayConfig);
    });
  };

  // try replay if authentication is missing
  function handleRpcResponse (res) {
    var rpcError, token, replay;

    if (res.data.jsonrpc === '2.0' && res.data.error) {

      rpcError = new Error();
      rpcError.originalError = res.data.error;
      rpcError.message = res.data.error.message;
      rpcError.level = ['danger', 'info', 'warning'].indexOf(res.data.error.level) >= 0 ? res.data.error.level : 'danger';
      rpcError.status = res.status;

      if (!res.config.isAnonymousMethod && (!res.config.headers[AUTH_HEADER] || (res.data.authenticated===false)) && res.data.error.code === -32104) {

        // simulate http 401 (to be caught by error handler)
        $log.debug('<!! JSON-RPC UNAUTHENTICATED ' + res.config.data.method);
        rpcError.status = 401;

        // try replay
        if (api.canReplay(res.config)) {
          $log.debug('refresh token & replay');
          return api.replay(res.config).then(handleRpcResponse).catch(function (replayError) {
            return $q.reject(rpcError);
          });
        }

        // cannot replay
        return $q.reject(rpcError);
      }

      // not an authentication error
      return $q.reject(rpcError);
    }

    // is ok response
    return res.data.result;
  }

  // catch errors after any replay attempts
  function catchAll (err) {
    $log.debug('api error, status=' + err.status, err.message);
    if (err.status === 401) {
      $log.debug('fatal 401');
      $rootScope.$broadcast('openwheels:fatal-401', err);
    }
  }

  // transform http config into multipart
  function configAsMultipart (config, multiPartParams) {
    var cfg = angular.copy(config);
    var parts = new FormData();

    // create part #1
    parts.append('jsonrpc', JSON.stringify(config.data));

    // create another part for each key
    angular.forEach(multiPartParams, function (value, key) {
      parts.append(key, value);
    });

    // replace data with multiparts
    cfg.data = parts;

    // make sure content-type is determined automatically & won't be reset by angular $http
    cfg.headers = cfg.headers || {};
    cfg.headers['Content-Type'] = undefined;
    cfg.transformRequest = function (data) {
      return data;
    };
    return cfg;
  }

  function createAuthHeader (token) {
    return token.accessToken;
  }

  return api;
})
;
