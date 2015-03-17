'use strict';

angular.module('cacheFactory', [])

.factory('cacheFactory', function ($window, $q, $cacheFactory) {

  var cacheFactories = {
    memory      : memoryCacheFactory,
    localStorage: localStorageCacheFactory
  };

  var factory = function (cacheId, cacheType) {
    // default to memory cache
    var cacheBackend = (cacheFactories[cacheType] || memoryCacheFactory)(cacheId);
    var pendingPromises = {};

    function cache (cacheKey, promiseFactory, maxAgeSeconds) {
      var item = cache.get(cacheKey);

      if (item && isExpired(item, maxAgeSeconds)) {
        cache.remove(cacheKey);
        item = null;
      }

      // create a new item if it doesn't exist yet
      if (!item) {
        pendingPromises[cacheKey] = pendingPromises[cacheKey] || promiseFactory();
        return pendingPromises[cacheKey].then(function (value) {
          if (pendingPromises[cacheKey]) {
            cache.put(cacheKey, value);
          }
          return value;
        });
      } else {
        // console.log('@cache: use cached "' + item.key + '"');
        return makePromise(item.value);
      }
    }

    cache.put = function (key, value) {
      var item = {
        key       : key,
        value     : value,
        timeStamp : moment().toDate()
      };
      cacheBackend.put(key, item);
      delete pendingPromises[key];
    };

    cache.get = function (key) {
      return cacheBackend.get(key);
    };

    cache.remove = function (key) {
      cacheBackend.remove(key);
    };

    function isExpired (item, maxAgeSeconds) {
      var maxAge = maxAgeSeconds || 0;
      var age = moment().diff(moment(item.timeStamp), 'milliseconds') / 1000;
      // console.log('@cache: expired? "' + item.key + '"', (age > maxAge), 'age=' + age, 'maxage=' + maxAge);
      return age > maxAge;
    }

    function makePromise (value) {
      var dfd = $q.defer();
      dfd.resolve(value);
      return dfd.promise;
    }

    return cache;
  };


  function memoryCacheFactory (cacheId) {
    return $cacheFactory(cacheId);
  }

  function localStorageCacheFactory (cacheId) {
    var localStorage = $window.localStorage;
    return {
      get: function (key) {
        try {
          return JSON.parse(localStorage[cacheId + '.' + key]);
        } catch (e) {
          return null;
        }
      },
      put: function (key, val) {
        localStorage[cacheId + '.' + key] = JSON.stringify(val);
      },
      remove: function (key) {
        delete localStorage[cacheId + '.' + key];
      }
    };
  }

  return factory;

});
