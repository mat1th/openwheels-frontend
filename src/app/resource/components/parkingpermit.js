'use strict';

angular.module('owm.resource.parkingpermit', ['alertService'])
.directive('parkingpermit', function ($compile) {
  return {
    restrict: 'E',
    link: function (scope, elm, attributes) {
      elm.attr('ng-if', 'features.parkingpermit');
      $compile(elm)(scope, function (clone) {
        elm.replaceWith(clone);
      });
    },
    scope: {
      resource: '=',
    },
    templateUrl: 'resource/components/parkingpermit.tpl.html',
    controller: 'ParkingpermitController'
  };
})
    
.controller('ParkingpermitController', function($scope, $log, alertService, resourceService) {
  var show = function (permits) {
    if(permits.length === 0) {
      $scope.create = true;
      $scope.update = false;
    } else {
      $scope.create = false;
      $scope.permit_id = permits[0].id;
      $scope.update = true;
    }
  };
  
  $scope.createParkingPermit = function () {
    alertService.load($scope, 'success', 'vergunning aanvragen');
    resourceService.createParkingpermit({resource: $scope.resource.id})
    .then(function(permit) {
      $log.debug('vergunning aangevraagt', permit);
      alertService.loaded($scope);
      alertService.add($scope, 'success', 'Vergunning brief verzonden.');
      return [permit];
    }).then(show, function (error) {
      alertService.loaded($scope);
      alertService.addError(error);
    });
  };
  
  $scope.updateParkingPermit = function (permit) {
    alertService.load($scope, 'success', 'vergunning wijzigen');
    resourceService.alterParkingpermit({parkingpermit: permit})
    .then(function(permit) {
      $log.debug('vergunning aangevraagt', permit);
      alertService.loaded($scope);
      alertService.add($scope, 'success', 'Vergunning brief verzonden.');
      return [permit];
    }).then(show, function (error) {
      alertService.loaded($scope);
      alertService.addError(error);
    });
  };

  
  $scope.removeParkingPermit = function (permit) {
    alertService.load($scope, 'success', 'vergunning verwijderen');
    resourceService.removeParkingpermit({parkingpermit: permit})
    .then(function(permit) {
      $log.debug('vergunning opgezecht', permit);
      alertService.loaded($scope);
      alertService.add($scope, 'success', 'Vergunning opzeg brief verzonden.');
      return [];
    }).then(show, function (error) {
      alertService.loaded($scope);
      alertService.addError(error);
    });
  };

  resourceService.getParkingpermits({
    resource: $scope.resource.id
  }).then(show);
});