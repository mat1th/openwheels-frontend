'use strict';

angular.module('owm.booking.administer', [])

.controller('BookingAdministerController', function ($scope, $state, $translate, alertService, bookingService, booking, declarationService, $anchorScroll, $mdDialog, contract) {
  $scope.booking  = booking;
  $scope.resource = booking.resource;
  $scope.trip     = angular.copy(booking.trip);
  $scope.maxDeclarations = 5;
  $scope.declaration = {};
  $scope.contract = contract;

  $scope.alreadyFilled = (booking.trip.odoBegin && booking.trip.odoEnd) ? true : false;
  loadDeclarations(booking.id);

  function loadDeclarations(bookingId) {
    if(contract.type.canHaveDeclaration) {
      declarationService.forBooking({booking: bookingId})
      .then(function(res) {
        $scope.declarations = res;
      })
      .catch(function(err) {
        alertService.add('danger', 'Tankbonnen konden niet opgehaald worden.', 4000);
      });
    }
  }

  function saveTrip() {
    if($scope.trip.odoBegin && !$scope.alreadyFilled) {
      var params = {
        booking : $scope.booking.id,
        odoBegin: $scope.trip.odoBegin
      };
      // End is NOT required
      if ($scope.trip.odoEnd) {
        if($scope.trip.odoEnd === 0) {
          return;
        }
        if($scope.trip.odoEnd < $scope.trip.odoBegin) {
          alertService.add('danger', 'Je kan geen negatief aantal gereden kilometers doorgeven', 5000);
          return;
        }
        params.odoEnd = $scope.trip.odoEnd;
      }

      alertService.load();
      bookingService.setTrip(params).then(function (booking) {
        alertService.add('success', $translate.instant('BOOKING.ADMINISTER.SAVE_SUCCESS'), 5000);
        if($scope.trip.odoEnd) {
          $scope.alreadyFilled = true;
        }
      })
      .catch(function (err) {
        alertService.addError(err);
      })
      .finally(function () {
        alertService.loaded();
      });
    }
  }

  $scope.addPicture = function(file) {
    $scope.declaration.file = file;
  };

  $scope.openDialog = function($event, declaration) {
    $mdDialog.show({
      controller: function($scope, $mdDialog) {
        $scope.image = 'declaration/' + declaration.image;
        $scope.declaration = declaration;
        $scope.hide = function() {
          $mdDialog.hide();
        };
      },
      templateUrl: 'booking/administer/declarationDialog.tpl.html',
      parent: angular.element(document.body),
      targetEvent: $event,
      clickOutsideToClose:true,
    })
    .then(function(res) {
    });
  };

  function saveDeclaration() {
    if($scope.declaration && $scope.declaration.amount) {
      if(!$scope.declaration.file) {
        alertService.add('danger', 'Je moet de foto/scan van de tankbon nog toevoegen');
        return;
      }
      alertService.load();
      var params = {
        booking : $scope.booking.id,
        description: '',
        amount: $scope.declaration.amount,
      };

      declarationService.create(params, {image: $scope.declaration.file})
      .then(function (results) {
        alertService.add('success', $translate.instant('BOOKING.ADMINISTER.SAVE_SUCCESS_DECLARATION'), 5000);
        $scope.declarations.unshift(results);
        $anchorScroll('scroll-to-top-anchor');
        $scope.declaration = {};
      })
      .catch(function (err) {
        alertService.addError(err);
      })
      .finally(function () {
        alertService.loaded();
      });
    }
  }

  $scope.submit = function () {
    saveTrip();
    saveDeclaration();
    $state.go('^.show', null, {reload: true});
  };

})
;
