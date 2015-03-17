describe('percentage filter', function () {

  var $filter;

  beforeEach(module('filters.percentage'));

  beforeEach(inject(function ($injector) {
    $filter = $injector.get('$filter');
  }));

  it('should round to 3 decimals by default', function () {
    expect($filter('percentage')(0.123456)).toBe('12.346%');
  });

  it('should round to 0 decimals', function () {
    expect($filter('percentage')(0.123456, 0)).toBe('12%');
  });

  it('should append custom suffix', function () {
    expect($filter('percentage')(0.5, 0, ' percent')).toBe('50 percent');
  });

  it('fallbacks', function () {
    expect($filter('percentage')(0)).toBe('0%');
    expect($filter('percentage')(null)).toBe('0%');
    expect($filter('percentage')(undefined)).toBe('0%');
  });

});
