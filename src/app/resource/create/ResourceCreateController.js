'use strict';

angular.module('owm.resource.create', ['owm.resource.create.carInfo', 'owm.resource.create.location', 'owm.resource.create.carPhotos', 'owm.resource.create.details'])

.controller('ResourceCreateController', function ($scope, $rootScope, $filter, $state, $log, $stateParams, $translate, resources, resourceService, authService, $anchorScroll, alertService, dialogService, me, Analytics) {

  var resource = {
    fromUser: resources,
    init: function () { //the start function that checks the state of the licencePlate
      var _this = this;
      $scope.isBusy = false;
      $scope.me = me;
      $scope.isLicencePlate = $stateParams.licencePlate !== undefined ? true : false;
      $scope.resource = {};
      $scope.licenceAlreadyListed = false;
      $scope.unknownLicence = false;
      $scope.unknownError = false;
      this.checkCurrentRoute();
      $rootScope.$on('$stateChangeSuccess', function () {
        _this.checkCurrentRoute();
      });

      if ($scope.isLicencePlate) { //check if the parammeter licencePlate is defined
        if (this.checkLicence()) { //checks if the licenceplate is added by user
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
        'registrationPlate': licencePlate
      }).then(function (resource) {
        Analytics.trackEvent('resource', 'resource_created', resource.id, true);
        return resourceService.alter({
          'resource': resource.id,
          'newProps': {
            'isAvailableOthers': 'false',
            'isAvailableFriends': 'false',
            'refuelByRenter': true,
            'dayRateTotal': dayPrice / 1,
            'kmFree': true,
            'hourRate': dayPrice / 10,
            'kilometerRate': 0.10
          }
        });
      }).then(function (resource) {
        $scope.resource = resource;
        $scope.$broadcast('resource_added', resource);
        $scope.isBusy = false;
      }).catch(function (err) {
        if (err.message === 'Een auto met dit kenteken bestaat al') {
          $scope.licenceAlreadyListed = true;
        } else if (err.message === 'Ongeldig kenteken') {
          $scope.unknownLicence = true;
        } else if (err.message) {
          $scope.unknownError = true;
        }
        $scope.isBusy = false;
      });
    },
    checkLicence: function () { //checks the lince if it is already added by the user
      var re = new RegExp('-', 'g');
      var plate = $stateParams.licencePlate.toLowerCase();
      return this.fromUser.every(function (elm, index) {
        if (elm.registrationPlate !== undefined && elm.registrationPlate !== null) {
          if (elm.registrationPlate.replace(re, '').toLowerCase() === plate.replace(re, '').toLowerCase()) {
            $scope.resource = elm;
            $log.debug('same number!');
            return false;
          } else {
            return true;
          }
        } else {
          return false;
        }
      });
    },
    checkCurrentRoute: function () {
      $scope.pageNumber = 1;
      if ($state.current.name === 'owm.resource.create.carInfo') {
        $scope.pageNumber = 1;
      } else if ($state.current.name === 'owm.resource.create.location') {
        $scope.pageNumber = 2;
      } else if ($state.current.name === 'owm.resource.create.carPhotos') {
        $scope.pageNumber = 3;
      } else {
        $scope.pageNumber = 4;
      }
    }
  };
  resource.init();
});
