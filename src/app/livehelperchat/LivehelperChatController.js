'use strict';

angular.module('owm.livehelperchat', [])

.controller('LivehelperChatController', function ($window, $log, $state, $rootScope, $scope, authService, featuresService) {
  if(!featuresService.get('livehelperchat')) {
    return ;
  }
  
  authService.userPromise().then(function (user) {
    if(!user.identity) {
      return;
    }
    
    var options = $window.LHCChatOptions = $window.LHCChatOptions || {};
    options.attr = [{
      name: 'userid',
      value: user.identity.id,
      type: 'hidden',
      size: 12,
    }];
    options.attr_prefill = [{
      name: 'email',
      value: '',
      hidden: true
    }, {
      name: 'username',
      value: user.identity.firstName,
      hidden: true
    }];
  });
  
  
  var options = $window.LHCChatOptions = $window.LHCChatOptions || {};
  options.opt = {widget_height:440,widget_width:300,popup_height:520,popup_width:500};

  var po = document.createElement('script');
  po.type = 'text/javascript';
  po.async = true;
  var referrer = (document.referrer) ? encodeURIComponent(document.referrer.substr(document.referrer.indexOf('://')+1)) : '';
  var location  = (document.location) ? encodeURIComponent(window.location.href.substring(window.location.protocol.length)) : '';
  po.src = 'https://openwheels.nl/lhc/index.php/nld/chat/getstatus/(click)/internal/(position)/bottom_right/(ma)/br/(hide_offline)/true/(top)/350/(units)/pixels/(leaveamessage)/true/(department)/1?r='+referrer+'&l='+location;
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(po, s);
  
});