'use strict';

angular.module('openwheels')

.config (function ($mdThemingProvider) {

  // GENERATED WITH http://angular-md-color.com/
  //
  // MyWheels huisstijl:
  // #5FAAC8 blue (verhuren)
  // #82B955 green (huren)
  // #E6A500 orange (informatie)
  // #E65A37 red
  // #5A5A5A gray

  var customPrimary = { // blue
    '50': '#bedce9',
    '100': '#abd2e2',
    '200': '#98c8dc',
    '300': '#85bed5',
    '400': '#72b4cf',
    '500': '#5FAAC8',
    '600': '#4ca0c1',
    '700': '#3e94b6',
    '800': '#3884a3',
    '900': '#317590',
    'A100': '#d1e6ef',
    'A200': '#e4f1f6',
    'A400': '#f7fbfc',
    'A700': '#2b657d'
  };

  var customAccent = { // orange
    '50': '#ffd466',
    '100': '#ffcd4d',
    '200': '#ffc533',
    '300': '#ffbe1a',
    '400': '#ffb700',
    '500': '#E6A500',
    '600': '#cc9300',
    '700': '#b38000',
    '800': '#996e00',
    '900': '#805c00',
    'A100': '#ffdb80',
    'A200': '#ffe299',
    'A400': '#ffeab3',
    'A700': '#664a00'
  };

  var customWarn = { // red
    '50': '#f4b7a8',
    '100': '#f1a592',
    '200': '#ee927b',
    '300': '#ec7f64',
    '400': '#e96d4e',
    '500': '#E65A37',
    '600': '#e34720',
    '700': '#d03e1a',
    '800': '#b93817',
    '900': '#a33114',
    'A100': '#f7cabf',
    'A200': '#faddd6',
    'A400': '#fdf0ec',
    'A700': '#8c2a12'
  };

  $mdThemingProvider.definePalette('customPrimary', customPrimary);
  $mdThemingProvider.definePalette('customAccent', customAccent);
  $mdThemingProvider.definePalette('customWarn', customWarn);

  $mdThemingProvider.theme('default')
    .primaryPalette('customPrimary')
    .accentPalette('customAccent')
    .warnPalette('customWarn');

});
