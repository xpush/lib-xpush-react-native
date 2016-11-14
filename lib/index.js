
var React = require('react-native');

var {
  NativeEventEmitter,
  NativeModules
} = React;

var XPushNative = NativeModules.XPushCore;
var XPushEventManager = new NativeEventEmitter(NativeModules.XPushCore);

var debug = function() {

}

var Util = {};
Util.getUniqueKey = function () {
  var s = [], itoh = '0123456789ABCDEF';
  for (var i = 0; i < 36; i++) s[i] = Math.floor(Math.random() * 0x10);
  s[14] = 4;
  s[19] = (s[19] & 0x3) | 0x8;
  for (var x = 0; x < 36; x++) s[x] = itoh[s[x]];
  s[8] = s[13] = s[18] = s[23] = '-';
  return s.join('');
}

var XPUSH_ON_MESSAGE = "xpush:message";

var XPush = {
  init : function(host, appId, userId, deviceId) {
    this.hostname = host;
    this.appId = appId;
    this.userId = userId ? userId : Util.getUniqueKey();
    this.deviceId = deviceId ? deviceId : 'web';
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
      this.sendText(message); 
    } else {
      this.sendData(message);
    }
  },
  sendText: function(message){
    if( !this.currentChannel ){
      throw {message:"There is no connected channel"}
    }
    XPushNative.sendText(message); 
  },
  sendData: function(message){
    if( !this.currentChannel ){
      throw {message:"There is no connected channel"}
    }
    XPushNative.sendData(message);
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