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

BOOKING - DONE
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

  + tripdata_entered
    - label: booking.id
    - value:
    - triggers
      - BookingAdministerController then after bookingService.setTrip

  
RESOURCE - DONE
  + resource_created
    - label: resource.id
    - value:
    - triggers
      - ResourceCreateController then after resourceService.create

  + discount_created
    - label: resource.id
    - value:
    - triggers
      - discountList.js then after $mdDialog.show

  + picture_uploaded
    - label: resource.id
    - value:
    - triggers
      - ResourceEditPicturesController then after resourceService.addPicture

  + info_edited
    - label: resource.id
    - value:
    - triggers
      - ResourceEditSharingsettingsController then after resourceService.alter

  + calendar_edited
    - label: resource.id
    - value:
    - triggers
      - ResourceShowCalendarController then after calendarService.createPeriodic and calendarService.createBlock


PERSON - DONE
  + created
    > postponed untill new flow has been finished

  + edited
    > postponed untill new flow has been finished

  + driverlicense_uploaded
    > postponed untill new flow has been finished

  + profilepicture_uploaded
    > postponed untill new flow has been finished

  + contract_ended
    - label: contract.id
    - value:
    - triggers
      - PersonContractIndexController then after contractService.alter

DISCOVERY
  + search
    - label: (boolean) isAuthenticated
    - value:
    - triggers
      - ResourcheSearchController then after resourceService.searchV2

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
