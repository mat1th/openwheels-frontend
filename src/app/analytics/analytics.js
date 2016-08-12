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

.config(function(AnalyticsProvider, appConfig) {
  AnalyticsProvider
  .setAccount(appConfig.ga_tracking_id)
  .trackUrlParams(true)
  .ignoreFirstPageLoad(true)
  .setPageEvent('$stateChangeSuccess')
  .useDisplayFeatures(true)
  ;
})
;

