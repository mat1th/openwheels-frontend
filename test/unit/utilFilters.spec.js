describe('textUtil filters', function () {

  var $filter;

  beforeEach(module('filters.util'));

  beforeEach(inject(function ($injector) {
    $filter = $injector.get('$filter');
  }));

  it('toTitleCase', function () {
    expect($filter('toTitleCase')('this is a sentence')).toBe('This Is A Sentence');
    expect($filter('toTitleCase')('THIS IS A SENTENCE')).toBe('This Is A Sentence');
    expect($filter('toTitleCase')('word')).toBe('Word');
  });

  it('containsAnyOf', function () {
    expect($filter('containsAnyOf')([1,2,3], [1, 4, 5])).toBe(true);
    expect($filter('containsAnyOf')([1,2,3], [4])).toBe(false);
    expect($filter('containsAnyOf')(['a', 'b', 'c'], ['a'])).toBe(true);
    expect($filter('containsAnyOf')(['a', 'b', 'c'], ['d'])).toBe(false);
    expect($filter('containsAnyOf')([], [])).toBe(false);
    expect($filter('containsAnyOf')([], null)).toBe(false);
    expect($filter('containsAnyOf')(null, [])).toBe(false);
  });

});
