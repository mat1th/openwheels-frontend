module.exports = {

  src_dir: 'src',
  build_dir: 'build',
  compile_dir: 'bin',
  vendor_dir: 'vendor',

  app_files: {
    js: [
      'src/**/*Module.js', // modules first
      'src/**/*.js'
    ],
    atpl: [ 'src/app/**/*.tpl.html' ],
    ctpl: [ 'src/common/**/*.tpl.html' ],
    html: [ 'src/index.html' ],
    less: 'src/less/main.less',
    htaccess: 'src/.htaccess'
  },

  vendor_files: {
    js: [
      'vendor/jquery/dist/jquery.js',
      'vendor/angular/angular.js',
      'vendor/angular-aria/angular-aria.js',
      'vendor/angular-material/angular-material.js',
      'vendor/angular-messages/angular-messages.js',
      'vendor/angular-animate/angular-animate.js',
      'vendor/angular-cookies/angular-cookies.js',
      'vendor/angular-sanitize/angular-sanitize.js',
      'vendor/angular-ui-router/release/angular-ui-router.js',
      'vendor/underscore/underscore.js',
      'vendor/momentjs/moment.js',
      'vendor/angular-bootstrap/ui-bootstrap-tpls.js',

      'vendor/angular-google-maps/dist/angular-google-maps.js',
      'vendor/lodash/dist/lodash.js', // required by angular-google-maps

       // front page slider
      'vendor/slick-carousel/slick/slick.js',
      'vendor/angular-slick/dist/slick.js',

      'vendor/angular-uuid/uuid.js',
      'vendor/angular-jsonrpc-q/build/jsonrpc.js',
      'vendor/angular-moment/angular-moment.js',
      'vendor/angular-percentage-filter/percentage.js',
      'vendor/angular-translate/angular-translate.js',
      'vendor/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
      'vendor/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
      'vendor/angular-translate-storage-local/angular-translate-storage-local.js',
      'vendor/angular-ui-utils/modules/unique/unique.js',
      'vendor/angular-ui-calendar/src/calendar.js',
      'vendor/fullcalendar/fullcalendar.js',
      'vendor/angularjs-geolocation/src/geolocation.js',
      'vendor/ngScrollTo/ng-scrollto.js',
      'vendor/ngstorage/ngStorage.js',
      'vendor/pickadate/lib/picker.js',
      'vendor/pickadate/lib/picker.date.js',
      'vendor/pickadate/lib/picker.time.js',
      'vendor/pickadate/lib/translations/nl_NL.js',
      'vendor/ng-sortable/dist/ng-sortable.js',
      'vendor/ng-optimizely/ng-optimizely.js',

      'vendor_custom/angular-locale/angular-locale_nl-nl.js',
      'vendor_custom/moment-locale/moment-locale_nl.js',
      'vendor_custom/ngAutocomplete/src/ngAutocomplete.js',
      'vendor_custom/pwstrength-bootstrap/pwstrength-bootstrap-1.2.2.js',
      'vendor_custom/angular-input-match/angular-input-match-1.4.1.js',
      'vendor_custom/autotrack-master/autotrack.js',
    ],
    fonts: [
      'vendor/font-awesome/fonts/*'
    ]
  }
};
