'use strict';

angular.module('owm.featuresService', [])

/**
 * USAGE
 * 1) From code: featureService.get('myFeature') = { some: setting } | null
 * 2) From html: <div ng-if="features.myFeature">enabled!</div>
 **/

.factory('featuresService', function ($rootScope, appConfig) {

  // Defaults
  var enabledFeatures = {
    homeCarousel       : false,
    verhuurTussenscherm: false,
    serverSideSignup   : false,
    serverSideShare    : true, // use server side links when social-sharing resources (opengraph)
    invoiceModuleV1    : false,
    invoiceModuleV2    : true,
    filtersSidebar     : false,
    resourceSidebar    : false,
    facebook           : false,
    twitter            : false,
    googlePlus         : false,

    // Auto-generated (see below):
    social             : false
  };

  // Parse app config
  angular.forEach(appConfig.features, function (value, key) {
    enabledFeatures[key] = value;
    enabledFeatures.social = enabledFeatures.facebook || enabledFeatures.twitter || enabledFeatures.googlePlus;
  });

  // Expose on rootscope
  $rootScope.features = enabledFeatures;

  function getByName (featureName) {
    return enabledFeatures[featureName];
  }

  return {
    get: getByName
  };

})
;
