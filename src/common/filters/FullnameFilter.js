'use strict';

angular.module('filters.fullname', [])

.filter('fullname', function () {
  return function (person) {

    var isString = angular.isString;

    var firstName   = isString(person.firstName)   ? person.firstName   : '';
    var preposition = isString(person.preposition) ? person.preposition : '';
    var surname     = isString(person.surname)     ? person.surname     : '';

    return ( (firstName + ' ' + preposition).trim() + ' ' + surname ).trim();
  };
})
;
