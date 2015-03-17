'use strict';

angular.module('filters.translateOrDefault', [])

/**
 * Returns translated value if found, or a (custom) default, otherwise empty string
 * This makes sure translation keys are never shown to users accidentally
 * USAGE: <span>{ 'SOMETHING_TO_BE_TRANSLATED' | translateOrDefault : 'Could not translate' }</span>
 */
.filter('translateOrDefault', function ($translate) {
  return function (key, defaultValue) {
    var translated = $translate.instant(key);
    return key === translated ? (defaultValue || '') : translated;
  };
})
;
