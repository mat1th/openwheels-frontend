'use strict';

angular.module('filters.avatar', [])

.filter('resourceAvatar', function (appConfig) {
  return function(resourcePics, size) {
    var avatar = 'assets/img/resource-avatar-' + size + '.jpg';

    if(resourcePics && resourcePics[size]) {
      avatar = appConfig.serverUrl + '/' + resourcePics[size];
    }
    return avatar;
  };
})

;
