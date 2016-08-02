'use strict';

angular.module('openwheels.analytics', [])

.provider('googleTagManager', function () {

  this.init = function (gtmContainerId) {

    // log container id
    console.log('GTM', gtmContainerId);

    /* jshint ignore:start */
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    '//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer', gtmContainerId);
    /* jshint ignore:end */
  };

  this.$get = ['$log', function ($log) {
    return angular.noop;
  }];
})


.provider('googleAnalytics', function() {

  this.init = function (trackingId) {

    /* jshint ignore:start */
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
    /* jshint ignore:end */

    window.ga('create', trackingId, 'auto');

    window.ga('require', 'pageVisibilityTracker');
    window.ga('require', 'eventTracker');
    window.ga('require', 'urlChangeTracker');

    window.ga('send', 'pageview');
  };

  this.$get = ['$log', function ($log) {
    return window.ga || function() {
      $log.debug('google analytics (disabled): ', arguments);
    };
  }];
});

