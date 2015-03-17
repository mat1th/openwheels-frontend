'use strict';
angular.module('owm.resource.show.calendar.booking', [])

	.controller('ResourceShowCalendarBookingController', function ($location, $scope, $state, $filter, $modalInstance, booking) {
		$scope.booking = booking;

		$scope.cancel = function () {
			$modalInstance.dismiss();
		};
	});