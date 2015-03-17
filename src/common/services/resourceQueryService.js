'use strict';

angular.module('owm.resourceQueryService', [])

.factory('resourceQueryService', function (API_DATE_FORMAT) {

  var URL_DATE_TIME_FORMAT = 'YYMMDDHHmm';
  var text      = '';
  var location  = null;
  var timeFrame = null;
  var radius    = null;

  function getText () { return text; }
  function setText (_text) {
    if (_text) {
      text = _text;
    } else {
      text = '';
    }
  }

  function getRadius () { return radius; }
  function setRadius (_radius) {
    try {
      radius = parseInt(_radius);
    } catch (e) {
      radius = null;
    }
  }

  function getLocation () { return location; }
  function setLocation (_location) {
    if (_location && _location.latitude && _location.longitude) {
      location = {
        latitude : _location.latitude,
        longitude: _location.longitude
      };
    } else {
      location = null;
    }
  }

  function getTimeFrame () { return timeFrame; }

  /**
   * Expects API-date-formatted strings
   */
  function setTimeFrame (_timeFrame) {
    var d1 = _timeFrame ? _timeFrame.startDate : null;
    var d2 = _timeFrame ? _timeFrame.endDate   : null;
    if ( d1 && d2 && moment(d1).isValid() && moment(d2).isValid() ) {
      timeFrame = {
        startDate: d1,
        endDate  : d2
      };
    } else {
      timeFrame = null;
    }
  }

  function createStateParams () {
    var stateParams = {};
    if (location) {
      stateParams.lat = location.latitude;
      stateParams.lng = location.longitude;
    }
    if (timeFrame) {
      stateParams.dtstart = moment(timeFrame.startDate).format(URL_DATE_TIME_FORMAT);
      stateParams.dtend   = moment(timeFrame.endDate  ).format(URL_DATE_TIME_FORMAT);
    }
    if (text) {
      stateParams.q = text;
    }
    if (radius) {
      stateParams.r = radius;
    }
    return stateParams;
  }

  function parseStateParams (stateParams) {
    if (!stateParams) { return; }

    setText(stateParams.q);

    setLocation({
      latitude : stateParams.lat,
      longitude: stateParams.lng
    });

    if (stateParams.dtstart && stateParams.dtend) {
      var momStart = moment(stateParams.dtstart, URL_DATE_TIME_FORMAT, !!'strict');
      var momEnd   = moment(stateParams.dtend  , URL_DATE_TIME_FORMAT, !!'strict');
      if (momStart.isValid() && momEnd.isValid()) {
        setTimeFrame({
          startDate: momStart.format(API_DATE_FORMAT),
          endDate  : momEnd.format(API_DATE_FORMAT)
        });
      }
    }

    setRadius(stateParams.r);
  }

  return {
    getText          : getText,
    setText          : setText,
    getRadius        : getRadius,
    setRadius        : setRadius,
    getLocation      : getLocation,
    getTimeFrame     : getTimeFrame,
    setLocation      : setLocation,
    setTimeFrame     : setTimeFrame,
    createStateParams: createStateParams,
    parseStateParams : parseStateParams
  };
})
;
