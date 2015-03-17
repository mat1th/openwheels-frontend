describe('', function () {
  it('', function () {
    expect(1).toBe(1);
  });
});

xdescribe('My first test', function () {

  var $httpBackend;

  beforeEach(module('openwheels'));

  beforeEach(inject(function ($injector) {
    $httpBackend = $injector.get('$httpBackend');
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should work', function () {
    $httpBackend.expectGET('assets/locale/nl_NL.json').respond(200, {});
    $httpBackend.expectGET('home/home.tpl.html').respond(200, {});
    $httpBackend.expectGET('navigation/navigation.tpl.html').respond(200, {});
    $httpBackend.expectGET('footer/footer.tpl.html').respond(200, {});
    $httpBackend.expectGET('branding/locale/nl_NL.json').respond(200, {});
    $httpBackend.flush();
  });

});
