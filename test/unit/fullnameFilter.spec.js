describe('fullname filter', function () {

  var $filter;

  beforeEach(module('filters.fullname'));

  beforeEach(inject(function ($injector) {
    $filter = $injector.get('$filter');
  }));

  it('should work', function () {
    expect(test('first', ''      , ''    )).toBe('first');
    expect(test(''     , 'middle', ''    )).toBe('middle');
    expect(test('first', 'middle', ''    )).toBe('first middle');
    expect(test(''     , ''      , 'last')).toBe('last');
    expect(test('first', ''      , 'last'    )).toBe('first last');
    expect(test(''     , 'middle', 'last')).toBe('middle last');
    expect(test('first', 'middle', 'last')).toBe('first middle last');

    expect(test(' ' , ' ' , ' ' )).toBe('');
    expect(test([]  , []  , []  )).toBe('');
    expect(test({}  , {}  , {}  )).toBe('');
    expect(test(null, null, null)).toBe('');
  });

  function test (first, middle, last) {
    return $filter('fullname')({
      firstName  : first,
      preposition: middle,
      surname    : last
    });
  }

});
