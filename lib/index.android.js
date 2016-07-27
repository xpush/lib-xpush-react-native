
var React = require('react-native');

var {
  DeviceEventEmitter,
  NativeModules
} = React;

var XPushNativeAndroid = NativeModules.XPushNativeAndroid;

var debug = function() {

}

var XPUSH_ON_MESSAGE = "xpush:message";

var XPush = {
  init : function(host, appId, userId, deviceId) {
    this.hostname = host;
    this.appId = appId;
    this.userId = userId;
    this.deviceId = deviceId;
    this.channelMap = {};
    return this;
  },
  ajax: function(url, cb){
    fetch(url)
    .then((response) => response.json())
    .then((responseJson) => {

      if( responseJson.status == 'ok' ){
        cb( null, responseJson.result )
      } else {
        cb( responseJson.status )
      }
    })
    .catch((error) => {
      cb(error);
    });
  },
  getNode: function(channel, cb) {
    var self = this;
    var url = self.hostname+self.Context.NODE+'/'+self.appId+'/'+channel;
    self.ajax(url, cb);
  },
  connect: function(channel, cb){
    var self = this;
    self.getNode(channel, function( err, data ){

      var param = data.server;

      param.appId = self.appId;
      param.userId = self.userId;
      param.deviceId = self.deviceId;

      XPushNativeAndroid.connect( param, function(result){
        self.channelMap[channel] = true;
        cb( null, result );
      });
    });
  },
  send: function(message){
    XPushNativeAndroid.send(message); 
  },
  onMessage: function(cb){
    DeviceEventEmitter.addListener( XPUSH_ON_MESSAGE, cb);
  },
  disconnect: function(){
    if( self.channelMap[channel] ){
      XPushNativeAndroid.disconnect();
      self.channelMap[channel] = false;
    }
  },
  join: function(channel, userIds, cb){
    if( this.channelMap[channel] ){
      XPushNativeAndroid.joinChannel(userIds, function(res){
        if (typeof res == 'string') {
          res = JSON.parse( res );
        }

        if ( res.status ==  "ok" ) {
          cb(res);
        } else {
          cb();
        }
      });
    }
  },
  leave: function(channel, cb){
    if( this.channelMap[channel] ){
      XPushNativeAndroid.leaveChannel(function(res){
        if (typeof res == 'string') {
          res = JSON.parse( res );
        }

        if ( res.status ==  "ok" ) {
          cb(res);
        } else if ( res.message == "ERR-NOTEXIST") {
          cb(res);
        } else {
          cb();
        }
      });
    }
  },
  ban: function(channel, userIds, cb){
    if( this.channelMap[channel] ){
      XPushNativeAndroid.banFromChannel(userIds, function(res){
        if (typeof res == 'string') {
          res = JSON.parse( res );
        }

        if ( res.status ==  "ok" ) {
          cb(res);
        } else {
          cb();
        }
      });
    }
  },
  getInfo: function(channel, cb){
    if( this.channelMap[channel] ){

      XPushNativeAndroid.getChannelInfo(function(res){
        if (typeof res == 'string') {
          res = JSON.parse( res );
        }

        if( res.status == "ok" ){
          cb( res.result );
        } else {
          cb( res.message );
        }
      });
    }
  },
}

XPush.Context = {
  NODE : '/node'
};

module.exports = XPush;