/**
 * Created by Wilgert on 8-1-2015.
 */
angular.module('owm.models.calendar.blockingEvent', ['owm.models.calendar.baseEvent'])
  .factory('BlockingEvent', function(BaseEvent){
    'use strict';
    function BlockingEvent(event){
      this.blocking = event;
      this.start  = event.start;
      this.end    = event.until;
      this.blocking.allDay = this.isAllDay();
      this.allDay = false;
      this.title  = this.getTitle();
      this.color  = 'rgb(230, 165, 0)';
      if(this._allDay){
        var d = moment(this.end).subtract(1, 'second');
        this.end = d.format(d._f);
      }
    }

    BlockingEvent.prototype = Object.create(BaseEvent.prototype);

    return BlockingEvent;
  });