'use strict';

angular.module('tokenService', [])

.factory('tokenService', function ($window, $log, $q, $injector, $rootScope, appConfig) {

  var KEY = 'openwheels_fauth';
  var DEFAULT_EXPIRES_IN = 4 * 7 * 24 * 3600; // 4 weeks
  var storage = $window.localStorage;
  var tokenService = {};
  var pendingRefreshToken;
  var storageEnabled = function () {
    try {
      storage.setItem('__test', 'test');
    } catch (e) {
      if (/QUOTA_?EXCEEDED/i.test(e.name)) {
        return false;
      }
    }
    return true;
  };
  var createCookie = function (name, value, days) {
    var expires;
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toGMTString();
    } else {
      expires = '';
    }
    document.cookie = name + '=' + value + expires + '; path=/';
  };
  var readCookie = function (name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  };
  var eraseCookie = function (name) {
    createCookie(name, '', -1);
  };
  createCookie('ppkcookie', 'testcookie2', 7);

  var tokenPrototype = {
    isExpired: function () {
      return this.expiryDate ? moment().isAfter(moment(this.expiryDate)) : false;
    },
    expiresIn: function () {
      return this.expiryDate ? moment(this.expiryDate).diff(moment(), 'milliseconds') / 1000 : DEFAULT_EXPIRES_IN;
    },
    isFresh: function () {
      var minRemainingSec = 15 * 60; // 15 minutes
      return this.expiresIn() >= minRemainingSec;
    },
    save: function () {
      var authData = JSON.stringify({
        tokenType: this.tokenType,
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        expiryDate: this.expiryDate
      });
      if (storageEnabled()) {
        storage.setItem(KEY, authData);
      } else {
        createCookie(KEY, authData, this.expiresIn);
      }
      return this;
    },
    refresh: function () {
      return refreshToken(this);
    }
  };

  tokenService.createToken = function (data) {
    var token = Object.create(tokenPrototype);
    var expiresIn = data.expiresIn;
    try {
      expiresIn = parseInt(expiresIn);
    } catch (ex) {
      expiresIn = DEFAULT_EXPIRES_IN;
    }
    angular.extend(token, {
      tokenType: data.tokenType,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiryDate: moment().add(expiresIn, 'seconds').toDate(),
    });
    return token;
  };

  tokenService.getToken = function () {
    var data, token;
    try {
      if (storageEnabled()) {
        data = JSON.parse(storage.getItem(KEY));
      } else {
        data = JSON.parse(readCookie(KEY));
      }

      token = Object.create(tokenPrototype);
      angular.extend(token, {
        // cast to string (prevents errors when storage contains messed up data, such as an Array)
        tokenType: data.tokenType ? data.tokenType + '' : null,
        accessToken: data.accessToken ? data.accessToken + '' : null,
        refreshToken: data.refreshToken ? data.refreshToken + '' : null,
        expiryDate: moment(data.expiryDate).toDate()
      });
      return token;
    } catch (e) {
      return null;
    }
  };

  tokenService.clearToken = function () {
    if (storageEnabled()) {
      storage.removeItem(KEY);
    } else {
      eraseCookie(KEY);
    }
  };

  function refreshToken(token) {
    var err, refresh;
    if (!token || !token.refreshToken) {
      err = new Error('don\'t have a refresh token');
      return $q.reject(err);
    }
    if (pendingRefreshToken) {
      return pendingRefreshToken;
    }

    $log.debug('--> refresh token');
    pendingRefreshToken = $injector.get('$http')({
      method: 'POST',
      url: appConfig.tokenEndpoint,
      data: 'client_id=' + appConfig.appId +
        '&client_secret=' + appConfig.appSecret +
        '&grant_type=' + 'refresh_token' +
        '&refresh_token=' + token.refreshToken,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    }).then(function (response) {
      $log.debug('<-- got fresh token');
      pendingRefreshToken = null;
      var freshToken = tokenService.createToken({
        tokenType: response.data.token_type,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in
      });
      freshToken.save();
      return freshToken;
    });
    pendingRefreshToken.catch(function (err) {
      $log.debug('<!! error getting fresh token (remove refresh token)');
      pendingRefreshToken = null;
      token.refreshToken = null;
      token.save();
    });
    return pendingRefreshToken;
  }

  return tokenService;
});
