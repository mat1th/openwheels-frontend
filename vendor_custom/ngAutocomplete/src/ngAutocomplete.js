/**
 * A directive for adding google places autocomplete to a text box
 * google places autocomplete info: https://developers.google.com/maps/documentation/javascript/places
 *
 * Usage:
 *
 * <input type="text"  ng-autocomplete ng-model="autocomplete" options="options" details="details/>
 *
 * + ng-model - autocomplete textbox value
 *
 * + details - more detailed autocomplete result, includes address parts, latlng, etc. (Optional)
 *
 * + options - configuration for the autocomplete (Optional)
 *
 *       + types: type,        String, values can be 'geocode', 'establishment', '(regions)', or '(cities)'
 *       + bounds: bounds,     Google maps LatLngBounds Object, biases results to bounds, but may return results outside these bounds
 *       + country: country    String, ISO 3166-1 Alpha-2 compatible country code. examples; 'ca', 'us', 'gb'
 *       + watchEnter:         Boolean, true; on Enter select top autocomplete result. false(default); enter ends autocomplete
 *
 * example:
 *
 *    options = {
 *        types: '(cities)',
 *        country: 'ca'
 *    }
 **/

angular.module('ngAutocomplete', [])
.config(['uiGmapGoogleMapApiProvider', function (uiGmapGoogleMapApiProvider) {
  'use strict';
  uiGmapGoogleMapApiProvider.configure({
    v: '3.18',
    libraries: 'places'
  });
}])
.directive('ngAutocomplete', ['$timeout', '$window', '$q', '$log', 'uiGmapGoogleMapApi', function ($timeout, $window, $q, $log, uiGmapGoogleMapApi) {
  'use strict';

  return {
    require: 'ngModel',
    scope: {
      ngModel: '=',
      options: '=?',
      details: '=?'
    },
    link: function (scope, element, attrs, controller) {
      var opts;
      var watchEnter = false;
      var initAutoComplete = function () {
        if (scope.gPlace === undefined) {
          scope.gPlace = new google.maps.places.Autocomplete(element[0], {});
        }
        scope.$watch(scope.watchOptions, function () {
          initOpts();
        }, true);
        google.maps.event.addListener(scope.gPlace, 'place_changed', function () {
          var result = scope.gPlace.getPlace();
          if (result !== undefined) {
            if (result.address_components !== undefined) {
              scope.$evalAsync(function () {
                scope.details = result;
                controller.$setViewValue(element.val());
              });
              $timeout(function () {
                scope.$emit('ngAutocomplete:details');
              });
            } else {
              if (watchEnter) {
                getPlace(result);
              }
            }
          }
        });
      };
      var initOpts = function () {
        opts = {};
        if (scope.options) {
          if (scope.options.watchEnter !== true) {
            watchEnter = false;
          } else {
            watchEnter = true;
          }
          if (scope.options.types) {
            opts.types = [];
            opts.types.push(scope.options.types);
            scope.gPlace.setTypes(opts.types);
          } else {
            scope.gPlace.setTypes([]);
          }
          if (scope.options.bounds) {
            opts.bounds = scope.options.bounds;
            scope.gPlace.setBounds(opts.bounds);
          } else {
            scope.gPlace.setBounds(null);
          }
          if (scope.options.country) {
            opts.componentRestrictions = {
              country: scope.options.country
            };
            scope.gPlace.setComponentRestrictions(opts.componentRestrictions);
          } else {
            scope.gPlace.setComponentRestrictions(null);
          }
        }
      };
      var getPlace = function (result) {
        var autocompleteService = new google.maps.places.AutocompleteService();
        if (result.name.length > 0) {
          autocompleteService.getPlacePredictions({
            input: result.name,
            offset: result.name.length
          }, function listentoresult(list, status) {
            if (list === null || list.length === 0) {
              scope.$evalAsync(function () {
                scope.details = null;
              });
              $timeout(function () {
                scope.$emit('ngAutocomplete:details');
              });
            } else {
              var placesService = new google.maps.places.PlacesService(element[0]);
              placesService.getDetails({'reference': list[0].reference}, function detailsresult(detailsResult, placesServiceStatus) {
                if (placesServiceStatus === google.maps.GeocoderStatus.OK) {
                  scope.$evalAsync(function () {
                    controller.$setViewValue(detailsResult.formatted_address);
                    element.val(detailsResult.formatted_address);
                    scope.details = detailsResult;
                    var watchFocusOut = element.on('focusout', function (event) {
                      element.val(detailsResult.formatted_address);
                      element.unbind('focusout');
                    });
                  });
                  $timeout(function () {
                    scope.$emit('ngAutocomplete:details');
                  });
                }
              });
            }
          });
        }
      };
      controller.$render = function () {
        var location = controller.$viewValue;
        element.val(location);
      };
      scope.watchOptions = function () {
        return scope.options;
      };


      if ($window.google && $window.google.maps && $window.google.maps.places) {
        initAutoComplete();
      } else {
        uiGmapGoogleMapApi.then(function () {
          if ($window.google && $window.google.maps && $window.google.maps.places) {
            initAutoComplete();
          } else {
            $log.error('Error loading Google Maps API');
          }
        }, function () {
          $log.error('Error loading Google Maps API');
        });
      }
    }
  };
}]);
