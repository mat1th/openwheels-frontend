'use strict';

angular.module('socialDirectives', [])
.directive('shareButtons', function ($rootScope, twitter, linksService) {
    return {
      restrict: 'A',
      scope: {
        url: '=',
        text: '=',
        resource: '='
      },
      template: '<table style="margin-top:10px"><tr>' +
        '<tr>' +
        '<td ng-if="features.facebook"><span facebook-share-button url="url"></span>&nbsp;&nbsp;</td>' +
        '<td ng-if="features.googlePlus"><span google-plus-share-button url="url"></span>&nbsp;&nbsp;</td>' +
        '<td ng-if="flyerPdf"><a ng-href="{{ flyerPdf }}" target="_blank"><i class="fa fa-fw fa-print"></i>{{ "SOCIAL_MAKE_FLYER" | translateOrDefault }}</a>&nbsp;&nbsp;</td>' +
        '<td ng-if="features.twitter"><span twitter-share-button url="url"></span>&nbsp;&nbsp;</td>' +
        '</tr>' +
        '</table>',
      link: function (scope, elm) {
        var FB = window.FB;

        scope.features = $rootScope.features;
        scope.flyerPdf = scope.features.serverSideShare && scope.resource ?
          linksService.flyerPdf(scope.resource.id, scope.resource.city) : null;
      }
    };
  })
  .directive('facebookShareButton', function () {
    return {
      restrict: 'A',
      scope: {
        url: '='
      },
      template: '<a ng-click = "shareFacebook()"><i class="fa fa-fw fa-facebook-square"></i>{{ "SOCIAL_SHARE_FACEBOOK" | translateOrDefault }}</a>',
      link: function (scope, elm) {
        var link = 'http://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(scope.url);
        var w = 600;
        var h = 600;
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 2) - (h / 2);
        var opts = 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,' +
          ', width=' + w +
          ', height=' + h +
          ', top=' + top +
          ', left=' + left;

        scope.shareFacebook = function () {
          window.open(link, '', opts);
        };
      }
    };
  })


.directive('twitterShareButton', function () {
  return {
    restrict: 'A',
    scope: {
      url: '='
    },
    template: '<a ng-click = "shareTwitter()"><i class="fa fa-fw fa-twitter-square"></i>{{ "SOCIAL_SHARE_TWITTER" | translateOrDefault }}</a>',
    link: function (scope, elm) {
      var link = 'http://twitter.com/home?status=' + encodeURIComponent(scope.url);
      var w = 600;
      var h = 600;
      var left = (screen.width / 2) - (w / 2);
      var top = (screen.height / 2) - (h / 2);
      var opts = 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,' +
        ', width=' + w +
        ', height=' + h +
        ', top=' + top +
        ', left=' + left;

      scope.shareTwitter = function () {
        window.open(link, '', opts);
      };
    }
  };
})

.directive('googlePlusShareButton', function () {
  return {
    restrict: 'A',
    scope: {
      url: '='
    },
    template: '<a ng-click = "shareGooglePlus()"><i class="fa fa-fw fa-google-plus-square"></i>{{ "SOCIAL_SHARE_GOOGLE_PLUS" | translateOrDefault }}</a>',
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
});
