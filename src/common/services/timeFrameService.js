'use strict';

angular.module('TimeFrameService', [])

	.factory('timeFrameService', function ($rootScope, $timeout, $http, $q, API_DATE_FORMAT) {
		return {
			getTimeFrame: function getTimeFrame(dtstart, dtend) {
				if (dtstart && dtend) {
					var moment1 = moment(dtstart, 'YYMMDDHHmm', !!'strict');
					var moment2 = moment(dtend, 'YYMMDDHHmm', !!'strict');
					if (moment1.isValid() && moment2.isValid()) {
						return {
							startDate: moment1.format(API_DATE_FORMAT),
							endDate: moment2.format(API_DATE_FORMAT)
						};
					}
				}
				return null;
			}
		};
	});
