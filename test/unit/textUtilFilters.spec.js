describe('textUtil filters', function () {

  var $filter;

  beforeEach(module('filters.textUtil'));

  beforeEach(inject(function ($injector) {
    $filter = $injector.get('$filter');
  }));

  it('toTitleCase', function () {
    expect($filter('toTitleCase')('this is a sentence')).toBe('This Is A Sentence');
    expect($filter('toTitleCase')('THIS IS A SENTENCE')).toBe('This Is A Sentence');
    expect($filter('toTitleCase')('word')).toBe('Word');
  });

});
