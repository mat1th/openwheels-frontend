'use strict';
angular.module('owm.resource.show.calendar.booking', [])

	.controller('ResourceShowCalendarBookingController', function ($location, $scope, $state, $filter, $uibModalInstance, booking) {
		$scope.booking = booking;

		$scope.cancel = function () {
			$uibModalInstance.dismiss();
		};

    $scope.goMember = function (personId) {
      $uibModalInstance.dismiss();
      $state.go('member', { personId: personId });
    };
	});
