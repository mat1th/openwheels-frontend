'use strict';

angular.module('owm.resource.show.calendar', [
  'owm.resource.show.calendar.booking',
  'owm.resource.show.calendar.blocking',
  'owm.models.calendar.bookingEvent',
  'owm.models.calendar.blockingEvent'
])

  .controller('ResourceShowCalendarController', function ($location, $scope, $state, $stateParams, $filter, $modal, $translate, me, calendarService, bookings, resource, blockings, BlockingEvent, BookingEvent, API_DATE_FORMAT) {
    $scope.resource = resource;
    $scope.view = $stateParams.view || 'agendaWeek';

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
        $modal.open({
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
        $modal.open({
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
                dayOfweek: moment(blocking.start).lang('nl').format('dddd').toLowerCase()
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
        $modal.open({
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

              otherProps.dayOfweek = moment(blocking.start).lang('nl').format('dddd').toLowerCase();

              calendarService.createPeriodic({
                resource: resource.id,
                otherProps: otherProps
              }).then(
                reload
              );
            } else {
              calendarService.createBlock({
                otherProps: {
                  start: blocking.start,
                  until: blocking.until
                },
                resource: resource.id
              }).then(function (blocking) {
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

    var selfColor = '#00aa00';
    var blockedColor = '#aa0000';

    $scope.calendarConfig = {
      height: 650,
      editable: false,
      defaultView: $scope.view,
      axisFormat: 'H(:mm)',
      columnFormat: 'ddd d/M',
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

    var getEventColor = function getEventColor(booking) {
      if (me && booking.person.id === me.id) {
        return selfColor;
      } else {
        return blockedColor;
      }
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
