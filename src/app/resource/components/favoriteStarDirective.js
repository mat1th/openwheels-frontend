'use strict';

angular.module('owm.resource.favoriteStar', [])

.directive('resourceFavoriteStar', function ($compile, resourceService, alertService) {

  var tpl = '' +
    '<i ng-click="toggle(false, $event)" ng-if="!busy && isFavorite" class="fa fa-fw fa-star text-warning"></i>' +
    '<i ng-click="toggle(true, $event)" ng-if="!busy && !isFavorite" class="fa fa-fw fa-star-o text-warning"></i>' +
    '<i ng-if="busy" class="fa fa-fw fa-star-o fa-spin text-mutes"></i>';

  return {
    restrict: 'E',
    scope: {
      resource: '='
    },
    controller: function ($scope) {

      $scope.isFavorite = $scope.resource.label === 'favorite';

      $scope.toggle = function (bool, $event) {
        $event.stopPropagation();

        var params = { resource: $scope.resource.id };
        var method = bool ? resourceService.addFavorite : resourceService.removeFavorite;

        $scope.busy = true;
        method(params).then(function () {
          $scope.isFavorite = bool;
        })
        .catch(function (err) {
          alertService.addError(err);
        })
        .finally(function () {
          $scope.busy = false;
        });
      };
    },

    link: function (scope, elm, attrs) {

      if (scope.resource.label) {
        $compile(tpl)(scope, function (clone) {
          elm.replaceWith(clone);
        });
      } else {
        elm.remove();
      }
    },


  };
});
