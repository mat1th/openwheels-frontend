'use strict';

angular.module('owm.linksService', [])

/**
 * Central registry for external links
 * Appends access token to urls if applicable
 */
.factory('linksService', function ($log, appConfig, tokenService) {

  return {
    signupUrl: function () {
      return process(appConfig.serverUrl + '/aanmelden');
    },
    bookingAgreementPdf: function (bookingId) {
      return process(appConfig.serverUrl + '/dashboard/reservering/' + bookingId + '/overeenkomst.pdf', true);
    },
    depositUrl: function () {
      return process(appConfig.serverUrl + '/dashboard/borg', true);
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
      return process(appConfig.serverUrl + '/auto-huren/' + (city || 'nederland').toLowerCase() + '/' + resourceId + '/flyer.pdf');
    },
    tripDetailsUrl: function (bookingId) {
      return process(appConfig.serverUrl + '/dashboard/ritten/' + bookingId, true);
    }
  };

  function process (link, useToken) {
    var out = link;
    var token;

    // TODO(Jorrit): Uncomment as soon as API supports this:
    // if (useToken) {
    //   token = tokenService.getToken();
    //   if (token && token.accessToken) {
    //     $log.info('generate external link', link);
    //     out = out + '?access_token=' + token.accessToken;
    //   } else {
    //     $log.warn('external link: token not available', link);
    //   }
    // }

    return out;
  }

})
;
