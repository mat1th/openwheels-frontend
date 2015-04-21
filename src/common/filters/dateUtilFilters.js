'use strict';

angular.module('filters.dateUtil', [])

/**
 * Returns a person's age in years (given a birthdate)
 */
.filter('personAge', function () {
  return function (birthDate, unitTestNow) {
    var now = unitTestNow ? moment(unitTestNow) : moment();
    return now.diff(moment(birthDate).startOf('day'), 'years');
  };
})

.filter('memberSince', function ($translate) {
  return function (date) {
    return (
      $translate.instant('MEMBER_SINCE_PREFIX') + ' ' +
      moment(date).fromNow() + ' ' +
      $translate.instant('MEMBER_SINCE_SUFFIX')
    ).trim();
  };
})
;
