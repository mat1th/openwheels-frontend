'use strict';

angular.module('owm.resource.show.calendar', [
  'owm.resource.show.calendar.booking',
  'owm.resource.show.calendar.blocking',
  'owm.models.calendar.bookingEvent',
  'owm.models.calendar.blockingEvent'
])

  .controller('ResourceShowCalendarController', function ($location, $scope, $state, $stateParams, $filter, $uibModal, $translate, me, calendarService, bookings, resource, blockings, BlockingEvent, BookingEvent, API_DATE_FORMAT, Analytics) {
    $scope.me = me;
    $scope.resource = resource;
    $scope.view = $stateParams.view || 'agendaWeek';

    Analytics.trackEvent('discovery', 'show_calendar', resource.id, true);

    function renderCalendar() {
      $scope.calendar.fullCalendar('render');
    }

    function reload() {
      $state.transitionTo($state.current, $stateParams, {
        reload: true,
        inherit: false,
        notify: true
      });
    }

    $scope.popupOnEventClick = function popupOnEventClick(event) {
      if (!me) {
        return;
      }


      function editBookingEvent() {
        $uibModal.open({
          templateUrl: 'resource/show/calendar/booking/resource-show-calendar-booking.tpl.html',
          controller: 'ResourceShowCalendarBookingController',
          resolve: {
            booking: function () {
              return event.booking;
            }
          }
        });
      }


      function editBlockingEvent() {
        $uibModal.open({
          templateUrl: 'resource/show/calendar/blocking/resource-show-calendar-blocking.tpl.html',
          controller: 'ResourceShowCalendarBlockingController',
          resolve: {
            blocking: function () {
              return event.blocking;
            }
          }
        }).result.then(function (blocking) {
            var newProps;
            if (blocking.remove) {
              removeBlocking(blocking);
              return;
            }
            if (blocking.calender_id) {
              newProps = {
                dayOfWeek: moment(blocking.start).lang('nl').format('dddd').toLowerCase()
              };
              if (blocking.allDay) {
                newProps.start = null;
                newProps.until = null;
              } else {
                newProps.start = blocking.start;
                newProps.until = blocking.until;
              }

              calendarService.alterPeriodic({
                calender: blocking.calender_id,
                newProps: newProps
              }).then(reload);
            } else {
              newProps = {
                start: blocking.start,
                until: blocking.until
              };

              calendarService.alterBlock(
                {
                  id: blocking.id,
                  newProps: newProps
                }
              ).then(
                updateEvent()
              );
            }

            function updateEvent() {
              event.blocking = blocking;
              event.start = blocking.start;
              event.end = blocking.until;
              renderCalendar();
            }
          });
      }

      if(event instanceof BookingEvent ){
        editBookingEvent();
      }


      if(event instanceof BlockingEvent && resource.owner.id === me.id){
        editBlockingEvent();
      }

      function removeBlocking(blocking) {
        if (blocking.calender_id) {
          calendarService.removePeriodic({
            calender: blocking.calender_id
          }).then(reload);
        } else {
          calendarService.removeBlock({
            id: blocking.id
          }).then(removeEvent);
        }
      }

      function removeEvent() {
        event.start = null;
        event.end = null;

        renderCalendar();
      }
    };

    $scope.popupOnDayClick = function popupOnDayClick(date, allDay, jsEvent, view) {
      if (!me) {
        return;
      }
      function addBlocking() {
        $uibModal.open({
          templateUrl: 'resource/show/calendar/blocking/resource-show-calendar-blocking.tpl.html',
          controller: 'ResourceShowCalendarBlockingController',
          resolve: {
            blocking: function () {
              return {
                start: moment(date).format(API_DATE_FORMAT),
                until: moment(date).add(6, 'hours').format(API_DATE_FORMAT)
              };
            }
          }
        }).result.then(function (blocking) {
            var otherProps = {};
            if (blocking.repeat) {

              if (blocking.allDay) {
                otherProps.start = null;
                otherProps.until = null;
              } else {
                otherProps.start = blocking.start;
                otherProps.until = blocking.until;
              }

              otherProps.dayOfWeek = moment(blocking.start).lang('nl').format('dddd').toLowerCase();

              calendarService.createPeriodic({
                resource: resource.id,
                otherProps: otherProps
              }).then(function(result) {
                  reload(result);
                  Analytics.trackEvent('resource', 'calendar_edited', resource.id, true);
                  return;
                });
            } else {
              calendarService.createBlock({
                otherProps: {
                  start: blocking.start,
                  until: blocking.until
                },
                resource: resource.id
              }).then(function (blocking) {
                Analytics.trackEvent('resource', 'calendar_edited', resource.id, true);
                $scope.events.push(new BlockingEvent(blocking));
                renderCalendar();
              });
            }
          });
      }

      function addBooking() {
        // not implemented yet
      }

      if (resource.owner.id === me.id) {
        addBlocking();
      }else{
        addBooking();
      }
    };

    $scope.changeView = function (view) {
      $scope.view = view;
      $location.search('view', view);
      $scope.calendar.fullCalendar('changeView', view);
    };

    $scope.calendarConfig = {
      /**
       * i18n
       * TODO(Jorrit): Upgrade to fullcalendar v2 (currently used angular-ui-calendar v0.8.1 only works with v1)
       */
      monthNames: 'januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december'.split('_'),
      monthNamesShort: 'jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec'.split('_'),
      dayNames: 'zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag'.split('_'),
      dayNamesShort: 'zo_ma_di_wo_do_vr_za'.split('_'),
      buttonText: {
        today: 'Nu',
        month: 'Maand',
        week: 'Week',
        day: 'Dag',
        prev: '<i class="fa fa-fw fa-chevron-left"></i>',
        next: '<i class="fa fa-fw fa-chevron-right"></i>'
      },
      axisFormat: 'H(:mm)',
      columnFormat: 'ddd d-M',
      titleFormat: {
        month: 'MMMM yyyy',
        week: 'd [MMM][ \'&#39;\'yy]{ - d MMM \'&#39;\'yy}',
      },

      height: 650,
      editable: false,
      defaultView: $scope.view,
      //timeFormat: 'H:mm',
      allDaySlot: false,
      slotDuration: '02:00',
      scrollTime: '07:00:00',
      firstDay: 1,
      header: {
        left: '',
        center: 'title',
        right: 'today prev,next'
      },
      eventClick: $scope.popupOnEventClick,
      dayClick: $scope.popupOnDayClick
    };

    $scope.events = [];
    $scope.eventSources = [$scope.events];

    bookings.forEach(function (booking) {
      $scope.events.push(new BookingEvent(booking));
    });

    blockings.forEach(function (blocking) {
      $scope.events.push(new BlockingEvent(blocking));
    });

  });
