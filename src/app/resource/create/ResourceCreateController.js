'use strict';

angular.module('owm.resource.create', ['owm.resource.create.carInfo', 'owm.resource.create.location'])

.controller('ResourceCreateController', function ($scope, $filter, $state, $log, $stateParams, $translate, resources, resourceService, authService, alertService, dialogService, me) {

  var resource = {
    fromUser: resources,
    init: function () { //the start function that checks the state of the licencePlate
      $scope.isBusy = false;
      $scope.me = me;
      $scope.isLicencePlate = $stateParams.licencePlate !== undefined ? true : false;
      $scope.resource = {};
      $scope.licenceAlreadyListed = false;
      this.ceckCurrentRoute();

      if ($scope.isLicencePlate) { //check if the parammeter licencePlate is defined
        if (this.checkLicence()) { //checks if the licenceplate is
          var dayPrice = $stateParams.dayPrice || 25;
          resource.create($stateParams.licencePlate, dayPrice);
        } else {
          $log.debug('the licencePlate is already in the database');
        }
      } else {
        $log.debug('there is no licencePlate defined');
      }
    },
    create: function (licencePlate, dayPrice) { //creates the resource with the standart parammeters
      $scope.isBusy = true;
      resourceService.create({
        'owner': me.id,
        'registrationPlate': licencePlate,
        'otherProps': {
          'isAvailableOthers': false,
          'isAvailableFriends': false,
          'refuelByRenter': true,
          'kmFree': true,
          'hourRate': '10',
          'kilometerRate': dayPrice / 10
        }
      }).then(function (resource) {
        $scope.resource = resource;
        $log.debug(resource);
        $scope.isBusy = false;
      }).catch(function (err) {
        if (err.message === 'Een auto met dit kenteken bestaat al') {
          $scope.licenceAlreadyListed = true;
        }
        $scope.isBusy = false;
      });
    },
    checkLicence: function () { //checks the lince if it is already added by the user
      var re = new RegExp('-', 'g');
      var plate = $stateParams.licencePlate.toLowerCase();

      return this.fromUser.every(function (elm, index) {
        if (elm.registrationPlate.replace(re, '').toLowerCase() === plate) {
          $scope.resource = elm;
          $log.debug('same number!');
          return false;
        } else {
          return true;
        }
      });
    },
    ceckCurrentRoute: function () {
      $scope.pageNumber = 1;
      if ($state.current.name === 'owm.resource.create.carInfo') {
        $scope.pageNumber = 1;
      } else if ($state.current.name === 'owm.resource.create.location'){
        $scope.pageNumber = 2;
      } else {
        $scope.pageNumber = 3;
      }
    }
  };
  resource.init();
});
