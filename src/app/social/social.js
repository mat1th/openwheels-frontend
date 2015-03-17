'use strict';

angular.module('openwheels.social', [])

.provider('facebook', function () {
  this.init = function (appId) {
    /* jshint ignore:start */
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = '//connect.facebook.net/nl_NL/sdk.js#xfbml=1&appId=' + appId + '&version=v2.0';
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    /* jshint ignore:end */
  };

  this.$get = [function () {
    return angular.noop;
  }];
})

.provider('twitter', function () {
  var twitter;

  this.init = function () {
    /* jshint ignore:start */
    window.twttr = (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0], t = window.twttr || {};
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://platform.twitter.com/widgets.js";
      fjs.parentNode.insertBefore(js, fjs);
      t._e = [];
      t.ready = function(f) {
        t._e.push(f);
      };
      return t;
    }(document, "script", "twitter-wjs"));
    /* jshint ignore:end */
  };

  this.$get = [function () {
    return angular.noop;
  }];

})
;
