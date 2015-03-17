'use strict';
angular.module('owm.pages.list-your-car-login',[])

.controller('ListYourCarLoginController', function ($scope, $state, authService, user) {

  $scope.login  = function () {
    if (user.isAuthenticated) {
      next();
    } else {
      authService.loginPopup().then(next);
    }
  };

  function next () {
    $state.go('owm.resource.create');
  }

})
;
