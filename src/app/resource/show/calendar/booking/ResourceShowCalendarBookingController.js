'use strict';
angular.module('owm.resource.show.calendar.booking', [])

	.controller('ResourceShowCalendarBookingController', function ($location, $scope, $state, $filter, $modalInstance, booking) {
		$scope.booking = booking;

		$scope.cancel = function () {
			$modalInstance.dismiss();
		};

    $scope.goMember = function (personId) {
      $modalInstance.dismiss();
      $state.go('member', { personId: personId });
    };
	});
