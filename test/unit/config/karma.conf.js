var buildConfig = require('../../../build.config.js');

module.exports = function(config) {
  config.set({

    basePath: '../../../',
    frameworks: ['jasmine'],
    browsers: ['PhantomJS'],

    files: [
      'vendor/jquery/dist/jquery.js',
      'vendor/angular/angular.js',
      'vendor/angular-mocks/angular-mocks.js',
      'vendor/angular-ui-router/release/angular-ui-router.js',
      'vendor/angular-ui-utils/modules/unique/unique.js',
      'vendor/angular-bootstrap/ui-bootstrap.js',
      'vendor/angular-ui-calendar/src/calendar.js',
      'vendor/angular-moment/angular-moment.js',
      'vendor/underscore/underscore.js',

      // 'test/unit/mocks/mock-googleMapsApi.js',
      // 'vendor/angular-google-maps/dist/angular-google-maps.js',

      'vendor/ng-sortable/dist/ng-sortable.js',
      'vendor/moment/moment.js',
      'vendor/ngstorage/ngStorage.js',
      'vendor/angular-cookies/angular-cookies.js',

      'vendor/angular-translate/angular-translate.js',
      'vendor/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
      'vendor/angular-translate-storage-local/angular-translate-storage-local.js',

      'vendor/headroom.js/dist/headroom.js',
      'vendor/headroom.js/dist/angular.headroom.js',
      'vendor/angularjs-geolocation/src/geolocation.js',
      'vendor/ngAutocomplete/src/ngAutocomplete.js',
      'vendor/angular-sanitize/angular-sanitize.js',
      'vendor/ngScrollTo/ng-scrollto.js',
      'vendor/snapjs/snap.js',
      'vendor/angular-snap/angular-snap.js',
    ]
    .concat(
      buildConfig.app_files.js
    )
    .concat([
      'test/unit/mocks/mock-templates-app.js',
      'test/unit/mocks/mock-templates-common.js',
      'test/unit/mocks/mock-environment.js',
      'test/unit/mocks/mock-config.js',

      'test/unit/**.spec.js'
    ])


  });
};
