'use strict';

angular.module('owm.meHelperService', [])

.service('meHelperService', function () {

  this.isReadyToStartBooking = isReadyToStartBooking;

  function isReadyToStartBooking(me) {
    if(!me) { return false; }
    console.log('ready to start booking');
    return true;
  }

});
