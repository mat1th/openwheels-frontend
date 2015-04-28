'use strict';

angular.module('socialDirectives', [])

.directive('shareButtons', function ($rootScope, twitter, linksService) {
  return {
    restrict: 'A',
    scope   : {
      url : '=',
      text: '=',
      resource: '='
    },
    template:
      '<table style="margin-top:10px"><tr>' +
        '<tr>' +
          '<td ng-if="features.facebook"><a ng-click="shareFb()"><i class="fa fa-fw fa-facebook-square"></i>{{ "SOCIAL_SHARE_FACEBOOK" | translateOrDefault }}</a>&nbsp;&nbsp;</td>' +
          '<td ng-if="features.googlePlus"><span google-plus-share-button url="url"></span>&nbsp;&nbsp;</td>' +
          '<td ng-if="flyerPdf"><a ng-href="{{ flyerPdf }}" target="_blank"><i class="fa fa-fw fa-print"></i>{{ "SOCIAL_MAKE_FLYER" | translateOrDefault }}</a>&nbsp;&nbsp;</td>' +
          '<td ng-if="features.twitter" style="padding-top: 4px"><span twitter-share-button url="url" text="text"></span>&nbsp;&nbsp;</td>' +
        '</tr>' +
      '</table>',
    link: function (scope, elm) {
      var FB = window.FB;

      scope.features = $rootScope.features;
      scope.flyerPdf = scope.features.serverSideShare && scope.resource ?
        linksService.flyerPdf(scope.resource.id, scope.resource.city) : null;

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
