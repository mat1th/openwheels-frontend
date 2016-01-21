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

  var customPrimary = {
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

  var customAccent = {
    '50': '#c4deaf',
    '100': '#b7d79d',
    '200': '#aacf8b',
    '300': '#9dc879',
    '400': '#8fc067',
    '500': '#82B955',
    '600': '#75ad47',
    '700': '#699b40',
    '800': '#5d8938',
    '900': '#507731',
    'A100': '#d2e6c1',
    'A200': '#dfedd3',
    'A400': '#ecf4e5',
    'A700': '#44652a'
  };

  var customWarn = {
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

  var customBackground = {
    '50': '#ffffff',
    '100': '#fbfbfb',
    '200': '#eeeeee',
    '300': '#e1e1e1',
    '400': '#d5d5d5',
    '500': '#c8c8c8',
    '600': '#bbbbbb',
    '700': '#aeaeae',
    '800': '#a2a2a2',
    '900': '#959595',
    'A100': '#ffffff',
    'A200': '#ffffff',
    'A400': '#ffffff',
    'A700': '#888888'
  };

  $mdThemingProvider.definePalette('customPrimary', customPrimary);
  $mdThemingProvider.definePalette('customAccent', customAccent);
  $mdThemingProvider.definePalette('customWarn', customWarn);
  $mdThemingProvider.definePalette('customBackground', customBackground);

  $mdThemingProvider.theme('default')
    .primaryPalette('customPrimary')
    .accentPalette('customAccent')
    .warnPalette('customWarn');

});
