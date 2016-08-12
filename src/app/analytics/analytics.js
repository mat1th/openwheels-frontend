'use strict';

angular.module('openwheels.analytics', [])

.provider('googleTagManager', function () {

  this.init = function (gtmContainerId) {

    // log container id
    console.log('GTM', gtmContainerId);

    /* jshint ignore:start */
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    '//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer', gtmContainerId);
    /* jshint ignore:end */
  };

  this.$get = ['$log', function ($log) {
    return angular.noop;
  }];
})

  .config(function(AnalyticsProvider, appConfig) {
    AnalyticsProvider
    .setAccount(appConfig.ga_tracking_id)
    .trackUrlParams(true)
    .ignoreFirstPageLoad(true)
    .setPageEvent('$stateChangeSuccess')
    .useDisplayFeatures(true)
    ;
  })
  ;
/*
LIST OF ALL EVENTS

BOOKING
  + created
    - label: (boolean) isAuthenticated
    - value: fix number 11 iif owner 282
    - triggers:
        - reservationForm.tpl click button
          * condition: button not disabled
    
  + cancelled_renter
    - label: booking.id
    - value:
    - triggers:
        - BookingShowController.js then after bookingService.cancel
  
  + cancelled_owner
    - label: booking.id
    - value:
    - triggers:
        - BookingShowController.js then after bookingService.cancel
  
  + rejected
    - label: booking.id
    - value:
    - triggers
      - BookingModule.js OnEnter state owm.booking.reject
      - BookingShowController.js then after bookingService.rejectRequest
  
  + accepted
    - label: booking.id
    - value: 4
    - triggers
      - BookingModule.js OnEnter state owm.booking.accept
      - BookingShowController.js then after bookingService.acceptRequest
  
  + form_interaction
    - label:
    - value:
  
  + discount_applied
    - label:
    - value:
    - triggers
      - ReservationFrom.js then after discountService.isApplicable
  
  
RESOURCE
  + resource_created
    - label: resource.id
    - triggers
      - ResourceCreateController then after resourceService.create

  + discount_created
    - label: resource.id
    - triggers
      - discountList.js then after $mdDialog.show

  + picture_uploaded
    - label: resource.id
    - triggers
      - ResourceEditPicturesController then after resourceService.addPicture

  + info_edited
    - label: resource.id
    - triggers
      - ResourceEditSharingsettingsController then after resourceService.alter

  + calendar_edited
    - label: resource.id
    - triggers
      - ResourceShowCalendarController then after calendarService.createPeriodic and calendarService.createBlock


PERSON
  + created
  + edited
  + driverlicense_uploaded
  + profilepicture_uploaded
  + tripdata_entered
  + contract_ended
  

DISCOVERY
  + search
  + filters_applied
  + show_car
    - label: resource_id
  + show_calendar
    - label: resource_id
  + send_message
    - label: resource.id

  
  PAYMENT
  + Payment tried
  + Payment made but failed
  + Payment succeeded (LABEL waarde voor Payments)
*/
