'use strict';

angular.module('owm.booking.administer', [])

.controller('BookingFinalizeController', function ($scope, booking, alertService, bookingService, $state) {
  alertService.load($scope);
  bookingService.finishTrip({booking: booking.id}).then(function (booking) {
    alertService.loaded($scope);
    alertService.add('success', 'De rit is afgerond', 4000);
    return $state.go('owm.booking.show', {
      booking: booking.id
    }, {reload: true});
  }, function (error) {
    return $state.go('owm.booking.show', {
      booking: booking.id
    }, {reload: true});
  });
})

.controller('BookingAdministerController', function ($scope, $state, $translate, alertService, bookingService, booking, declarationService, $anchorScroll, $mdDialog, contract, Analytics) {
  $scope.booking  = booking;
  $scope.bookingStarted = moment().isAfter(moment(booking.beginBooking));
  $scope.bookingEnded = moment().isAfter(moment(booking.endBooking));
  $scope.resource = booking.resource;
  $scope.trip     = angular.copy(booking.trip);
  $scope.maxDeclarations = 5;
  $scope.declaration = {};
  $scope.contract = contract;

  $scope.allowDeclarations = contract.type.canHaveDeclaration && ($scope.booking.approved === 'OK' || $scope.booking.approved === null) && $scope.bookingStarted && !$scope.booking.resource.refuelByRenter && !booking.resource.fuelCardCar;
  $scope.allowDeclarationsAdd = $scope.allowDeclarations && moment().isBefore(moment(booking.endBooking).add(5, 'days'));

  if(booking.resource.refuelByRenter) {
    $scope.contract.type.canHaveDeclaration = false;
  }

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
    if(!$scope.alreadyFilled) {
      var params = {
        booking : $scope.booking.id,
        odoBegin: $scope.trip.odoBegin
      };
      // End is NOT required
      if ($scope.trip.odoEnd) {
        if($scope.trip.odoEnd < $scope.trip.odoBegin) {
          alertService.add('danger', 'Je kan geen negatief aantal gereden kilometers doorgeven', 5000);
          return;
        }
        params.odoEnd = $scope.trip.odoEnd;
      }

      alertService.load();
      bookingService.setTrip(params).then(function (booking) {
        Analytics.trackEvent('booking', 'tripdata_entered', booking.id, undefined, true);
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
        $state.go('^.show', null, {reload: true});
      });
    } else {
      $state.go('^.show', null, {reload: true});
    }
  }

  $scope.addPicture = function(file) {
    $scope.declaration.file = file;
  };

  $scope.openDialog = function($event, declaration) {
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
        $scope.image = 'declaration/' + declaration.image;
        $scope.declaration = declaration;
        $scope.hide = function() {
          $mdDialog.hide();
        };
      }],
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
        return alertService.add('danger', 'Je moet de foto/scan van de tankbon nog toevoegen', 6000);
      }
      var alreadyHasAmount = _.find($scope.declarations, function(declaration) { return declaration.amount === $scope.declaration.amount; });
      if(alreadyHasAmount !== undefined) {
        return alertService.add('danger', 'Er is al een tankbon met dit bedrag toegevoegd', 6000);
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
        saveTrip();
      });
    } else {
      saveTrip();
    }
  }

  $scope.submit = function () {
    saveDeclaration();
  };

})
;
