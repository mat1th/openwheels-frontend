describe('Api service', function () {

  var $http, $httpBackend, $rootScope, api, tokenService;

  var appConfig = {
    serverUrl: 'SERVER_URL',
    appUrl   : 'APP_URL',
    appId    : 'APP_ID',
    tokenEndpoint: 'TOKEN_ENDPOINT'
  };

  var apiEndpoint = appConfig.serverUrl + '/api/';

  var nonExpiredTokenData = {
    tokenType   : 'TOKEN_TYPE',
    accessToken : 'VALID_ACCESS_TOKEN',
    refreshToken: 'VALID_REFRESH_TOKEN',
    expiresIn   : 20 * 60 // 20 min
  };

  var expiredTokenData = {
    tokenType   : 'TOKEN_TYPE',
    accessToken : 'EXPIRED_TOKEN',
    refreshToken: 'VALID_REFRESH_TOKEN',
    expiresIn   : 0
  };

  var refreshTokenResponse = {
    token_type   : 'TOKEN_TYPE',
    access_token : 'REFRESHED_TOKEN',
    refresh_token: 'REFRESH_TOKEN',
    expires_in   : 3600 // 1 hour
  };

  var sampleData = { some: 'data' };

  beforeEach(function () {
    localStorage.clear();
    module('tokenService');
    module('api', function ($provide) {
      $provide.constant('appConfig', appConfig);
    });

    inject(function ($injector) {
      $http        = $injector.get('$http');
      $httpBackend = $injector.get('$httpBackend');
      $rootScope   = $injector.get('$rootScope');
      api          = $injector.get('api');
      tokenService = $injector.get('tokenService');
    })
  });

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  /**
   * -----------------------------------------------
   * BASIC REQUESTS (no authentication)
   * -----------------------------------------------
   */

  it('should send jsonrpc request + resolve promise', function () {
    var data, headers, resolved;

    // SETUP
    $httpBackend.expectPOST(apiEndpoint, function (_data) {
      data = _data;
      return true;
    }, function (_headers) {
      headers = _headers;
      return true;
    }).respond({ result: sampleData });

    // INVOKE
    api.invokeRpcMethod('some.method').then(function (response) { resolved = response; });
    $httpBackend.flush();

    // VERIFY
    expect(data).toMatch('"jsonrpc":"2.0"');
    expect(data).toMatch('"id":');
    expect(data).toMatch('"method":"some.method"');
    expect(headers['X-Simple-Auth-App-Id']).toEqual(appConfig.appId);
    expect(headers['X-Simple-Auth-Digest']).toBeUndefined();
    expect(resolved).toEqual(sampleData);
  });

  it('should catch jsonrpc errors', function () {
    var caught;

    // SETUP
    $httpBackend.expectPOST(apiEndpoint).respond({ jsonrpc: '2.0', error: { message: 'MESSAGE', level: 'danger' } });

    // INVOKE
    api.invokeRpcMethod('some.method').catch(function (err) { caught = err; });
    $httpBackend.flush();

    // VERIFY
    expect(caught.message).toEqual('MESSAGE');
    expect(caught.level).toEqual('danger');
  });

  it('should catch http errors', function () {
    var caught;

    // SETUP
    $httpBackend.expectPOST(apiEndpoint).respond(500, 'ERROR');

    // INVOKE
    api.invokeRpcMethod('some.method').catch(function (err) { caught = err; });
    $httpBackend.flush();

    // VERIFY
    expect(caught.data).toEqual('ERROR');
  });

  /**
   * -----------------------------------------------
   * AUTHENTICATED REQUESTS
   * -----------------------------------------------
   */

  it('should set authentication header (if we have an access token)', function () {
    var headers, token;

    // SETUP
    token = tokenService.createToken(nonExpiredTokenData).save();
    $httpBackend.expectPOST(apiEndpoint, undefined, function (_headers) {
      headers = _headers;
      return true;
    }).respond('');

    // INVOKE
    api.invokeRpcMethod('some.method');
    $httpBackend.flush();

    // VERIFY
    expect(headers['X-Simple-Auth-Digest']).toEqual(token.accessToken);
  });

  it('should try REFRESH TOKEN on HTTP 401', function () {
    var caught;
    var token = tokenService.createToken(expiredTokenData).save();
    $httpBackend.expectPOST(apiEndpoint).respond(401, 'ERROR');
    $httpBackend.expectPOST(appConfig.tokenEndpoint).respond(500);
    api.invokeRpcMethod('some.method').catch(function (err) { caught = err; });
    $httpBackend.flush();
    expect(caught.data).toEqual('ERROR');
  });

  it('should try REFRESH TOKEN on jsonrpc-unauthorized"', function () {
    // ..if api returns code -32104 + authenticated=false
    var caught;
    var token = tokenService.createToken(expiredTokenData).save();
    $httpBackend.expectPOST(apiEndpoint).respond(200, { jsonrpc: '2.0', authenticated: false, error: { code: -32104, message: 'MESSAGE' } });
    $httpBackend.expectPOST(appConfig.tokenEndpoint).respond(500, '');
    api.invokeRpcMethod('some.method').catch(function (err) { caught = err });
    $httpBackend.flush();
    expect(caught.message).toEqual('MESSAGE');
  });

  it('should NOT try REFRESH TOKEN if a call doesn\'t require authentication', function () {
    var method;
    // SETUP
    tokenService.createToken(expiredTokenData).save();
    method = api.createRpcMethod('some.method', true);
    // simulate 401, which would normally trigger token refresh;
    $httpBackend.expectPOST(apiEndpoint).respond(200, { jsonrpc: '2.0', authenticated: false, error: { code: -32104, message: 'MESSAGE' } });

    // INVOKE
    method();
    $httpBackend.flush();
  });

  it('should NOT try REFRESH TOKEN if we don\'t have a refresh token', function () {
    var caught;

    // SETUP (simulate 401, which would trigger token refresh);
    $httpBackend.expectPOST(apiEndpoint).respond(401, 'ERROR');

    // INVOKE
    api.invokeRpcMethod('some.method').catch(function (err) { caught = err; });
    $httpBackend.flush();

    // VERIFY
    expect(caught.data).toEqual('ERROR');
  });

  it('should NOT try REFRESH TOKEN on errors unrelated to authentication', function () {
    var token, caught;

    // SETUP
    token = tokenService.createToken(expiredTokenData).save();
    $httpBackend.expectPOST(apiEndpoint).respond(500, 'ERROR');

    // INVOKE
    api.invokeRpcMethod('some.method').catch(function (err) { caught = err; });
    $httpBackend.flush();

    // VERIFY
    expect(caught.data).toEqual('ERROR');
  });

  it('should catch errors during token refresh', function () {
    var token, caught;

    // SETUP
    token = tokenService.createToken(expiredTokenData).save();

    // #1 Original request (simulate 401, so a replay will be triggered)
    $httpBackend.expectPOST(apiEndpoint).respond(401, 'ERROR');

    // #2 Token refresh (simulate error)
    $httpBackend.expectPOST(appConfig.tokenEndpoint).respond(500, '');

    // INVOKE
    api.invokeRpcMethod('some.method').catch(function (err) { caught = err; });
    $httpBackend.flush();

    // VERIFY
    expect(caught.data).toEqual('ERROR');
  });

  it('should try REPLAY on unauthorized error (after refreshing token)', function () {
    var oldToken, originalHeaders, replayHeaders, resolved, newToken;

    // SETUP
    oldToken = tokenService.createToken(expiredTokenData).save();

    // #1 Original request (simulate 401, so a replay will be triggered)
    $httpBackend.expectPOST(apiEndpoint, undefined, function (headers) {
      originalHeaders = headers;
      return true;
    }).respond(401, '');

    // #2 Token refresh (successful)
    $httpBackend.expectPOST(appConfig.tokenEndpoint).respond(refreshTokenResponse);

    // #3 Replay request (successful)
    $httpBackend.expectPOST(apiEndpoint, undefined, function (headers) {
      replayHeaders = headers;
      return true;
    }).respond({ result: sampleData });

    // INVOKE
    api.invokeRpcMethod('some.method').then(function (result) { resolved = result });
    $httpBackend.flush();
    newToken = tokenService.getToken();

    // VERIFY
    expect(originalHeaders['X-Simple-Auth-Digest']).toEqual(expiredTokenData.accessToken);
    expect(replayHeaders  ['X-Simple-Auth-Digest']).toEqual('REFRESHED_TOKEN');
    expect(resolved).toEqual(sampleData);
    expect(newToken.accessToken).toEqual('REFRESHED_TOKEN');
    expect(newToken.isExpired()).toBe(false);
  });

  it('should NOT try REPLAY more than once', function () {
    tokenService.createToken(expiredTokenData).save();
    $httpBackend.expectPOST(apiEndpoint).respond(200, { jsonrpc: '2.0', authenticated: false, error: { code: -32104, message: 'MESSAGE' } });
    $httpBackend.expectPOST(appConfig.tokenEndpoint).respond(refreshTokenResponse);
    $httpBackend.expectPOST(apiEndpoint).respond(200, { jsonrpc: '2.0', authenticated: false, error: { code: -32104, message: 'MESSAGE' } });
    api.invokeRpcMethod('some.method');
    $httpBackend.flush();
  });

  it('should broadcast an event if a call fails and cannot be replayed', function () {
    var receivedEvent, eventCount = 0, caught;

    // SETUP
    spyOn($rootScope, '$broadcast').and.callFake(function (evt) {
      receivedEvent = evt;
      eventCount++;
    });
    tokenService.createToken(expiredTokenData).save();
    $httpBackend.expectPOST(apiEndpoint).respond(401, 'ERROR');
    $httpBackend.expectPOST(appConfig.tokenEndpoint).respond(refreshTokenResponse);
    $httpBackend.expectPOST(apiEndpoint).respond(401, '');

    // INVOKE
    api.invokeRpcMethod('some.method').catch(function (err) { caught = err; });
    $httpBackend.flush();

    // VERIFY
    expect(receivedEvent).toEqual('openwheels:fatal-401');
    expect(eventCount).toEqual(1);
    expect(caught.data).toEqual('ERROR');
  });

  it('test race condition', function () {
    var receivedEvent, eventCount = 0, caught1, caught2, caught3;

    // SETUP
    spyOn($rootScope, '$broadcast').and.callFake(function (evt) {
      receivedEvent = evt;
      eventCount++;
    });
    tokenService.createToken(expiredTokenData).save();

    // call 1
    $httpBackend.expectPOST(apiEndpoint).respond(401, 'apiError1');
    // call 2
    $httpBackend.expectPOST(apiEndpoint).respond(401, 'apiError2');
    // call 3
    $httpBackend.expectPOST(apiEndpoint).respond(401, 'apiError3');
    // 1 single token refresh
    $httpBackend.expectPOST(appConfig.tokenEndpoint).respond(refreshTokenResponse);
    // replay 1
    $httpBackend.expectPOST(apiEndpoint).respond(401, 'replayError1');
    // replay 2
    $httpBackend.expectPOST(apiEndpoint).respond(401, 'replayError2');
    // replay 3
    $httpBackend.expectPOST(apiEndpoint).respond(401, 'replayError3');

    // INVOKE
    api.invokeRpcMethod('method1').catch(function (err) { caught1 = err; });
    api.invokeRpcMethod('method2').catch(function (err) { caught2 = err; });
    api.invokeRpcMethod('method3').catch(function (err) { caught3 = err; });
    $httpBackend.flush();

    // VERIFY
    expect(receivedEvent).toEqual('openwheels:fatal-401');
    expect(eventCount).toEqual(1);
    expect(caught1.data).toEqual('apiError1');
    expect(caught2.data).toEqual('apiError2');
    expect(caught3.data).toEqual('apiError3');
    expect(receivedEvent).toEqual('openwheels:fatal-401');
    expect(eventCount).toEqual(1);
  });

  it('rpc method factory', function () {
    var method = api.createRpcMethod('some.method', false);
    $httpBackend.expectPOST(apiEndpoint).respond(200, '');
    method({ param: 'rpcParam' }, { param: 'multiPartParam' });
    $httpBackend.flush();
  });

});
