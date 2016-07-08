'use strict';

angular.module('owm.linksService', [])

/**
 * Central registry for external links
 * Appends access token to urls if applicable
 */
.factory('linksService', function ($log, $rootScope, appConfig, tokenService, featuresService) {

  var linksService = {
    bookingAgreementPdf: function (bookingId) {
      return process(appConfig.serverUrl + '/dashboard/reservering/' + bookingId + '/overeenkomst.pdf', true);
    },
    invoiceGroupPdf: function (invoiceGroupId) {
      return process(appConfig.serverUrl + '/verzamelfactuur/' + invoiceGroupId + '.pdf', true);
    },
    invoiceGroupPdf_v1: function (invoiceGroupId) {
      return process(appConfig.serverUrl + '/dashboard/facturen-verzamel/' + invoiceGroupId + '.pdf', true);
    },
    resourceUrl: function (resourceId, city) {
      return process(appConfig.serverUrl + '/auto-huren/' + (city || 'nederland').toLowerCase() + '/' + resourceId);
    },
    flyerPdf: function (resourceId, city) {
      return process(appConfig.serverUrl + '/auto-huren/' + (city || 'nederland').toLowerCase() + '/' + resourceId + '/flyer.pdf', true);
    },
    tripDetailsUrl: function (bookingId) {
      return process(appConfig.serverUrl + '/dashboard/ritten/' + bookingId);
    },
    tripDetailsPdf: function (bookingId) {
      return process(appConfig.serverUrl + '/dashboard/ritten/' + bookingId + '/print.pdf', true);
    }
  };

  // Expose on $rootScope
  $rootScope.linksService = linksService;

  // Log usage, optionally append access token
  function process (link, useToken) {
    var out = link;
    var token;

    if (useToken) {
      token = tokenService.getToken();
      if (token && token.accessToken) {
        $log.debug('external link + access token', link);
        out = out + '?access_token=' + token.accessToken;
      } else {
        $log.debug('external link: token not available', link);
      }
    }

    return out;
  }

  return linksService;

})
;
