
var React = require('react-native');

var {
  NativeEventEmitter,
  NativeModules
} = React;

var XPushNative = NativeModules.XPushCore;
var XPushEventManager = new NativeEventEmitter(NativeModules.XPushCore);

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
    this.currentChannel = undefined;
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

      XPushNative.connect( param, function(result){
        self.currentChannel = channel;
        self.channelMap[channel] = true;
        cb( null, result );
      });
    });
  },
  send: function(message){
     if('string' === typeof message){
      XPushNative.send(message); 
    } else {
      XPushNative.sendWithData(message);
    }
  },
  sendImage: function(fileUri, progressListener, callback){
    var cb;
    var cbPl;

    if( progressListener && callback ){
      cb = callback;
      cbPl = progressListener;
    } else if( progressListener && !callback ){
      cb = progressListener;
      cbPl = null;
    } else {
      console.log( "Not supported" );
    }

    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', self.hostname+"/upload", true);
    xhr.onload = () => {
      if (xhr.status !== 200) {
        cb( 'Upload failed. Expected HTTP 200 OK response, got ' + xhr.status );
        return;
      }
      if (!xhr.responseText) {
        cb( 'Upload failed. No response payload.' );
        return;
      }
      var resData = JSON.parse(xhr.responseText);
      if (resData.status == 'ok') {
        cb( null, resData.result.url );
      }
    };

    var fileNm = 'image.jpg';

    var formdata = new FormData();
    formdata.append("file", {type: "image/jpeg", name: fileNm, uri: fileUri });

    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          if( cbPl ){
            cbPl( event.loaded / event.total );
          }
        }
      };
    }

    xhr.setRequestHeader("XP-A", self.appId);
    xhr.setRequestHeader("XP-C", self.currentChannel);
    xhr.setRequestHeader("XP-U", self.userId);
    xhr.setRequestHeader("XP-FU-org", fileNm);
    xhr.setRequestHeader("XP-FU-nm", fileNm.substring(0, fileNm.lastIndexOf(".")));
    xhr.setRequestHeader("XP-FU-tp", "image");

    xhr.send(formdata);
  },
  onMessage: function(cb){
    XPushEventManager.addListener( XPUSH_ON_MESSAGE, cb);
  },
  disconnect: function(){
    if( self.channelMap[channel] ){
      XPushNative.disconnect();
      self.channelMap[channel] = false;
      self.currentChannel = undefined;
    }
  },
  join: function(channel, userIds, cb){
    if( this.channelMap[channel] ){
      XPushNative.joinChannel(userIds, function(res){
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
      XPushNative.leaveChannel(function(res){
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
      XPushNative.banFromChannel(userIds, function(res){
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

      XPushNative.getChannelInfo(function(data){
        if (typeof res == 'string') {
          res = JSON.parse( res );
        }
        if( data.status == "ok" ){
          cb( data.result );
        } else {
          cb( data.message );
        }
      });
    }
  },
}

XPush.Context = {
  NODE : '/node'
};

module.exports = XPush;