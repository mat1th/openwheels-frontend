'use strict';

angular.module('socialDirectives', [])

.directive('shareButtons', function ($rootScope, twitter) {
  return {
    restrict: 'A',
    scope   : {
      url : '=',
      text: '='
    },
    template: '<table style="margin-top:10px"><tr>' +
                '<td><a ng-if="features.facebook" ng-click="shareFb()"><i class="fa fa-fw fa-facebook-square"></i>{{ "SOCIAL_SHARE_FACEBOOK" | translateOrDefault }}</a></td>' +
                '<td style="padding: 4px 0 0 8px"><span ng-if="features.googlePlus" google-plus-share-button url="url"></span></td>' +
                '<td style="padding: 4px 0 0 8px"><span ng-if="features.twitter" twitter-share-button url="url" text="text"></span></td>' +
              '</table>',
    link: function (scope, elm) {
      var FB = window.FB;

      scope.features = $rootScope.features;

      scope.shareFb = function () {
        FB.ui({
          method: 'share',
          href  : scope.url
        });
      };

    }
  };
})

.directive('twitterShareButton', function () {
  return {
    restrict: 'A',
    scope: {
      url: '=',
      text: '='
    },
    link: function (scope, elm) {
      window.twttr.widgets.createShareButton(scope.url, elm[0], {
        text: scope.text
      });
    }
  };
})

.directive('googlePlusShareButton', function () {
  return {
    restrict: 'A',
    scope: {
      url: '='
    },
    template: '<a ng-click="shareGooglePlus()"><i class="fa fa-fw fa-google-plus-square"></i>{{ "SOCIAL_SHARE_GOOGLE_PLUS" | translateOrDefault }}</a>',
    link: function (scope, elm) {
      var link = 'https://plus.google.com/share?url=' + encodeURIComponent(scope.url);

      var w = 600;
      var h = 600;
      var left = (screen.width / 2) - (w / 2);
      var top = (screen.height / 2) - (h / 2);
      var opts = 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,' +
        ', width=' + w +
        ', height=' + h +
        ', top=' + top +
        ', left=' + left;

      scope.shareGooglePlus = function () {
        window.open(link, '', opts);
      };
    }
  };
})
;
