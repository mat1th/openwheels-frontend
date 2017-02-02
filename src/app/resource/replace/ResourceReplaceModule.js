'use strict';

angular.module('owm.resource.replace', [])
.controller('ResourceReplaceController', function ($scope, $log, $q, resource,
  members, resourceService, alertService, $state) {
  $scope.resource = resource;
  $scope.changePlate = function (licenceplate) {
    alertService.load($scope);
    resourceService.create({
      registrationPlate: licenceplate,
      owner: resource.owner.id
    }).then(function (nResource) {
      var result = [];
      for(var i = 0; i < members.length; i++) {
        result.push(resourceService.addMember({
          resource: nResource.id,
          person: members[i].id
        }));
      }
      return $q.all(result).then(function (){
        return resourceService.getParkingpermits({
          resource: resource.id
        });
      }).then(function (permit) {
        var result = [];
        if(permit.length === 0){
          throw 'geen parkeer verguning gevonden';
        }
        for(var i = 0; i < permit.length; i++) {
          result.push(resourceService.alterParkingpermit({
            parkingpermit: permit[i].id,
            resource: nResource.id
          }));
        }
        return $q.all(result);
      });
    }).then(function (permit) {
      alertService.loaded($scope);
      alertService.add($scope, 'success', 'Auto gewijzigd.');
      $state.go('owm.resource.own');
    }, function (error) {
      alertService.loaded($scope);
      alertService.addError(error);
    });
  };
});