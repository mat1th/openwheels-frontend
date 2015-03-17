/**
 * Created by Wilgert on 8-1-2015.
 */
angular.module('owm.models.calendar.baseEvent', [])
  .factory('BaseEvent', function($translate){
    'use strict';
    function BaseEvent(){
    }

    BaseEvent.prototype.blockedColor = 'rgb(230, 90, 55)';
    BaseEvent.prototype.selfColor = 'rgb(130, 185, 85)';

    BaseEvent.prototype.getTitle = function(){
      if (this.isAllDay()) {
        return $translate.instant('ALL_DAY');
      } else {
        return moment(this.start).format('HH:mm') + '-' + moment(this.end).format('HH:mm');
      }
    };

    BaseEvent.prototype.isAllDay = function(){
      return new Date(this.start).getHours() + new Date(this.end).getHours() === 0;
    };

    return BaseEvent;
  });