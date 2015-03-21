describe('dateUtil filters', function () {

  var $filter;

  beforeEach(module('filters.dateUtil'));

  beforeEach(inject(function ($injector) {
    $filter = $injector.get('$filter');
  }));

  describe('age filter', function () {

    it('should return correct age', function () {
      var birthDate;

      birthDate = '1982-01-01';
      expect($filter('personAge')(birthDate, '1982-01-01')).toBe(0);
      expect($filter('personAge')(birthDate, '1999-12-31')).toBe(17);
      expect($filter('personAge')(birthDate, '2000-01-01')).toBe(18);

      birthDate = '1982-01-01 15:00';
      expect($filter('personAge')(birthDate, '2000-01-01')).toBe(18);
    });
  });

});
