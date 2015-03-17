'use strict';

angular.module('filters.textUtil', [])

.filter('toSentenceCase', function () {
  return function (text) {
    var txt = text || '';
    return txt.slice(0,1).toUpperCase() + txt.slice(1);
  };
})

.filter('toTitleCase', function () {
  return function (text) {
    var words = text.split(' ');
    var word;
    for (var i=0; i < words.length; i++) {
      word = words[i];
      words[i] = word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase();
    }
    return words.join(' ');
  };
})

.filter('surroundWith', function () {
  return function (text, before, after) {
    return text ? before + text + after : '';
  };
})

.filter('trustAsHtml', ['$sce', function ($sce) {
  return function (text) {
    return $sce.trustAsHtml(text);
  };
}])
;
