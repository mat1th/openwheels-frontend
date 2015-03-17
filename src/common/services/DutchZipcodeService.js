'use strict';

angular.module('DutchZipcodeService', [])

.factory('dutchZipcodeService', function($rootScope, $timeout, $http, $q) {
  var zipcodeService = {};
  var pro6pp_auth_key = 'Xv1RdZtTHhXgcaOF';

  // Trigger on '5408xb' and on '5408 XB'
  var NL_SIXPP_REGEX = /[0-9]{4,4}\s?[a-zA-Z]{2,2}/;
  var NL_STREETNUMBER_REGEX = /[0-9]+/;
  var pro6pp_cache = {};

  function getApiBaseUrl() {
    // Use HTTPS API if website itself is also secure.
    // Otherwise, some browsers might complain about insecure content.
    if ('https:' === document.location.protocol) {
      return 'https://pro6pp.appspot.com/v1';
    } else {
      return 'http://api.pro6pp.nl/v1';
    }
  }

  function pro6pp_cached_get(obj, url, params) {
    var key = JSON.stringify(params);
    var deferred = $q.defer();
    if (pro6pp_cache.hasOwnProperty(key)) {
      deferred.resolve(pro6pp_cache[key]);
    } else {
      $http.get(url, { params: params})
      .success(function(data) {
        pro6pp_cache[key] = data;
        deferred.resolve(data);
      })
      .error(function() {
        deferred.reject({
          message: 'Unable to contact Pro6PP validation service'
        });
      });
    }
    return deferred.promise;
  }

  zipcodeService.autocomplete = function(obj) {
    var deferred = $q.defer();
    var zipcode = obj.zipcode;
    var streetnumber = obj.streetNumber;
    // Streetnumber is only required when there's an input field defined for it.
    // There may be use-cases where the streetnumber is not required.
    if (NL_SIXPP_REGEX.test(zipcode) && (!angular.isDefined(streetnumber) || NL_STREETNUMBER_REGEX.test(streetnumber))) {
      var url = getApiBaseUrl() + '/autocomplete';
      var params = {
        auth_key: pro6pp_auth_key,
        nl_sixpp: zipcode,
        streetnumber: streetnumber
      };
      pro6pp_cached_get(obj, url, params)
      .then(function(data) {
        if(data.error) {
          deferred.reject(data.error);
        } else{
          deferred.resolve(data.results);
        }
      });
    } else {
      deferred.reject({
        message: 'Invalid zipcode or street number'
      });
    }
    return deferred.promise;
  };

  return zipcodeService;
})

;
