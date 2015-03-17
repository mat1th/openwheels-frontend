describe('tokenService', function () {

  var service, $rootScope, $httpBackend;

  var appConfig = {
    appId        : 'myAppId',
    appSecret    : 'myAppSecret',
    tokenEndpoint: 'myTokenEndpoint'
  };

  var data = {
    tokenType   : 'myTokenType',
    accessToken : 'myAccessToken',
    refreshToken: 'myRefreshToken',
    expiresIn   : 20 * 60 // 20 min
  };

  beforeEach(function () {
    module('tokenService', function ($provide) {
      $provide.constant('appConfig', appConfig);
    });
  });

  beforeEach(inject(function ($injector) {
    service      = $injector.get('tokenService');
    $rootScope   = $injector.get('$rootScope');
    $httpBackend = $injector.get('$httpBackend');
    service.clearToken();
  }));

  it('should create token', function () {
    var now = new Date();
    var token = service.createToken(data);

    // token contents
    expect(token.tokenType).toEqual(data.tokenType);
    expect(token.accessToken).toEqual(data.accessToken);
    expect(token.refreshToken).toEqual(data.refreshToken);

    // expiry date
    var expectedExpiry = now.getTime() + (data.expiresIn * 1000); // ms
    var actualExpiry = token.expiryDate.getTime(); // ms
    expect(actualExpiry - expectedExpiry).toBeLessThan(50); // give or take the time it takes to create the token

    // expires in
    expect(token.expiresIn()).toBeLessThan(data.expiresIn); // token was just created, so just "slightly less"
    expect(token.expiresIn()).toBeGreaterThan(data.expiresIn - 1); // give or take a second

    // is expired, is fresh
    expect(token.isExpired()).toBe(false);
    expect(token.isFresh()).toBe(true);
  });

  it('should clear token', function () {
    var token = service.createToken(data);
    token.save();
    service.clearToken();
    expect(service.getToken()).toBe(null);
  });

  it('should set a default expiry date if we don\'t have expires_in', function () {
    var d = angular.copy(data);
    d.expiresIn = null;
    token = service.createToken(d);
    expect(token.expiryDate).toBeDefined();
    expect(token.expiryDate).not.toBe(null);
  });

  describe('token', function () {

    it('should save', function () {
      var token = service.createToken(data);
      token.save();
      var savedToken = service.getToken();
      expect(savedToken).toEqual(token);
    });

    it('should not say "expired" if there\'s no expiry date', function () {
      var token = service.createToken(data);
      token.expiryDate = null;
      expect(token.isExpired()).toBe(false);
      expect(token.expiresIn()).toBeGreaterThan(0);
    });
  });

  describe('token refresh', function () {

    var response = {
      token_type   : 'freshTokenType',
      access_token : 'freshAccessToken',
      refresh_token: 'freshRefreshToken',
      expires_in   : 20 * 60 // 20 min
    };


    it('should work', function () {
      var token = service.createToken(data);

      $httpBackend.expectPOST(appConfig.tokenEndpoint).respond(200, response);

      // try refresh
      var freshToken;
      token.refresh().then(function (token) {
        freshToken = token;
      });
      $httpBackend.flush();
      $rootScope.$apply();

      // check if it was saved
      expect(service.getToken()).toEqual(freshToken);

      // check refreshed token
      expect(freshToken.tokenType).toBe(response.token_type);
      expect(freshToken.accessToken).toBe(response.access_token);
      expect(freshToken.refreshToken).toBe(response.refresh_token);
      expect(freshToken.expiryDate).toBeDefined();
    });


    it('should fail if no refreshToken', function () {
      var token = service.createToken(data);
      token.refreshToken = null;

      // try refresh
      var error;
      token.refresh().catch(function (err) {
        error = true;
      });
      $rootScope.$apply();

      expect(error).toBe(true);
    });


    it('should gracefully handle error response', function () {
      var token = service.createToken(data);
      $httpBackend.expectPOST(appConfig.tokenEndpoint).respond(400, null);

      // try refresh
      var error;
      token.refresh().catch(function (err) {
        error = true;
      });
      $httpBackend.flush();
      $rootScope.$apply();

      expect(error).toBe(true);

      // refresh token should be reset
      expect(token.refreshToken).toBe(null);
    });


    it('should not send out multiple http requests at the same time', function () {
      var token = service.createToken(data);

      // expect a single post
      $httpBackend.expectPOST(appConfig.tokenEndpoint).respond(400, response);

      // try multiple refreshes
      var freshToken1, freshToken2;
      token.refresh().then(function (token) {
        freshToken1 = token;
      });
      token.refresh().then(function (token) {
        freshToken2 = token;
      });
      $httpBackend.flush();
      $rootScope.$apply();

      expect(freshToken1).toBe(freshToken2);
    });

  });

});
