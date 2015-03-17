'use strict';
angular.module('owm.resource.show.calendar.blocking', [])

	.controller('ResourceShowCalendarBlockingController', function ($location, $scope, $state, $filter, $modalInstance, blocking, API_DATE_FORMAT) {
		$scope.blocking = angular.copy(blocking);

		$scope.dateConfig = {
			//model
			modelFormat: API_DATE_FORMAT,
			formatSubmit: 'yyyy-mm-dd',

			//view
			viewFormat: 'DD-MM-YYYY',
			format: 'dd-mm-yyyy',
			//options
			selectMonths: true

		};

		$scope.timeConfig = {
			//model
			modelFormat: API_DATE_FORMAT,
			formatSubmit: 'HH:i',

			//view
			viewFormat: 'HH:mm',
			format: 'HH:i',

			//options
			interval: 15
		};


		var timeCache = {};

		function fillTimeCache(){
			timeCache.start = moment($scope.blocking.start, API_DATE_FORMAT);
			timeCache.until = moment($scope.blocking.until, API_DATE_FORMAT);
		}

		var dayModified = false;

		$scope.$watch('blocking.allDay', function (newValue){
			if(newValue){
				fillTimeCache();

				if(moment($scope.blocking.start).isSame($scope.blocking.until, 'day')){
					$scope.blocking.until = moment($scope.blocking.start).add(1, 'days').format(API_DATE_FORMAT);
					dayModified = true;
				}

				$scope.blocking.start = moment($scope.blocking.start, API_DATE_FORMAT).hours(0).minutes(0).format(API_DATE_FORMAT);
				$scope.blocking.until = moment($scope.blocking.until, API_DATE_FORMAT).hours(0).minutes(0).format(API_DATE_FORMAT);
			}else{
				if((dayModified || blocking._allDay) && moment($scope.blocking.start).add(1, 'days').isSame($scope.blocking.until, 'day')){
					$scope.blocking.until = moment($scope.blocking.until).subtract(1, 'days').format(API_DATE_FORMAT);
				}

				if(timeCache.start){
					$scope.blocking.start= moment($scope.blocking.start, API_DATE_FORMAT).hours(timeCache.start.hours()).minutes(timeCache.start.minutes()).format(API_DATE_FORMAT);
					$scope.blocking.until= moment($scope.blocking.until, API_DATE_FORMAT).hours(timeCache.until.hours()).minutes(timeCache.until.minutes()).format(API_DATE_FORMAT);
				}
			}
		});

		$scope.save = function(){
			$modalInstance.close($scope.blocking);
		};

		$scope.remove = function(){
			$scope.blocking.remove = true;
			$modalInstance.close($scope.blocking);
		};

		$scope.cancel = function () {
			$modalInstance.dismiss();
		};
	});