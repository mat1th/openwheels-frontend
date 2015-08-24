'use strict';

angular.module('owm.metaInfoService', [])

/**
 * Dynamically insert title and meta tags, in conjunction with directive
 *
 * USAGE
 * 1) Set properties from code, free form
 *      metaInfoService.set({ title: 'Title', description: 'Description'})
 *
 * 2) Register DOM elements whose attribute (A) or inner text (B) should be set
 *      A) <meta name="description" meta-info meta-info-attr="content" meta-info-prop="description">
 *      B) <title meta-info meta-info-prop="title"></title>
 *
 * 3) Call flush() on stateChangeSuccess, will turn into
 *      A) <meta name="description" content="Description">
 *      B) <title>Title</title>
 **/
.service('metaInfoService', function ($translate, $log, appConfig) {

  var tmp = {};
  var tmp_translate = {};
  var elems = [];

  // Set pieces of meta data, such as title, description, etc.
  this.set = function (data) {
    angular.extend(tmp, data);
  };

  // Convenience for using translation keys, defers actual translation until flush
  this.setTranslated = function (data) {
    angular.extend(tmp_translate, data);
  };

  this.isSet = function (prop) {
    return !!tmp[prop] || !!tmp_translate[prop];
  };

  // Register DOM elements whose attribute or inner text should be changed when flush() is called
  // Used by corresponding directive
  this.register = function (elm, attr, prop) {
    elems.push({
      elm: elm,
      attr: attr,
      prop: prop
    });
  };

  // Loop though registered elements and set their respective attributes / inner text.
  this.flush = function () {
    $translate('SITE_NAME').then(function (siteName) {
      var defaults = {
        title: $translate.instant('META_DEFAULT_TITLE'),
        description: $translate.instant('META_DEFAULT_DESCRIPTION'),
        url: appConfig.appUrl,
        image: appConfig.appUrl + '/branding/img/bg.jpg'
      };

      // translate
      angular.forEach(tmp_translate, function (value, key) {
        var translated = $translate.instant(value);
        if (translated !== value) {
          tmp[key] = $translate.instant(value);
        }
      });

      // extend defaults
      var data = angular.extend({}, defaults, tmp);

      // append site name
      data.title = data.title + ' | ' + siteName;

      // cleanup
      tmp = {};
      tmp_translate = {};

      elems.forEach(function (item) {
        if (!data[item.prop]) {
          $log.debug('meta property "' + item.prop + '" has no value');
          return;
        }
        if (item.attr) {
          // set attribute
          item.elm.attr(item.attr, data[item.prop]);
        } else {
          // no attribute? set as inner text
          item.elm.text(data[item.prop]);
        }
      });
    });
  };

});
