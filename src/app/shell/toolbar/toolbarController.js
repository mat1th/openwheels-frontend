'use strict';

angular.module('owm.shell')

.controller('ToolbarController', function ($scope, $state) {
	$scope.centralb = $state.current.name === 'home.centraalbeheer';
});
