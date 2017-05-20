//
//  ChannelCore.swift
//  SampleApp
//
//  Created by James Jung on 2016. 5. 29..
//  Copyright © 2016년 Facebook. All rights reserved.
//

import Foundation
//
//  ChannelCore.swift
//
//
//  Created by James Jung on 2016. 5. 29..
//
//

import Foundation

class ChannelCore: NSObject {
  var socket: SocketIOClient!

  var mAppId: String?;
  var mUserId: String?;
  var mDeviceId: String?;

  var mChannelId: String?;
  var mServerUrl: String?;
  var mServerName: String?;
  var connectionSuccessCallback: RCTResponseSenderBlock!;

  var mEvents: [String:NormalCallback]!;

  /// Type safe way to create a new SocketIOClient. opts can be omitted
  internal init(mAppId: String, mUserId: String, mDeviceId: String, mChannelId: String, mServerUrl: String, mServerName: String) {
    self.mAppId = mAppId;
    self.mUserId = mUserId;
    self.mDeviceId = mDeviceId;
    self.mChannelId = mChannelId;
    self.mServerUrl = mServerUrl;
    self.mServerName = mServerName;
  };

  internal func connect(handlers: [String:NormalCallback]){
    let url = self.mServerUrl!;

    var params:[String:AnyObject] = [String:AnyObject]();
    params["A"] = self.mAppId as AnyObject?;
    params["C"] = self.mChannelId as AnyObject?;
    params["S"] = self.mServerName as AnyObject?;
    params["D"] = self.mDeviceId as AnyObject?;
    params["U"] = self.mUserId as AnyObject?;

    socket = SocketIOClient(socketURL: URL(string:url)!, config:[.log(true), .forceNew(true), .connectParams(params), .nsp("/channel") ]);

    mEvents = handlers;

    for handler in handlers {
      socket?.on(handler.0, callback: handler.1);
    }

    self.socket.connect();
  };

  internal func sendText(message:String){
    if self.socket != nil {
      var json:[String:AnyObject] = [String:AnyObject]();
      var data:[String:AnyObject] = [String:AnyObject]();
      var user:[String:AnyObject] = [String:AnyObject]();

      user["U"] = self.mUserId as AnyObject?;
      data["UO"] = user as AnyObject?;
      data["MG"] = message as AnyObject?;

      json["DT"] = data as AnyObject?;
      json["NM"] = "message" as AnyObject?;

      self.socket.emit("send", json );
    }
  };

  internal func sendData(param:[String:AnyObject]){
    if self.socket != nil {
      var json:[String:AnyObject] = [String:AnyObject]();
      var user:[String:AnyObject] = [String:AnyObject]();
      var data = param;

      user["U"] = self.mUserId as AnyObject?;
      data["UO"] = user as AnyObject?;

      json["DT"] = data as AnyObject?;
      json["NM"] = "message" as AnyObject?;

      self.socket.emit("send", json );
    }
  };

  internal func disconnect(){
    if self.socket != nil {

      for handler in self.mEvents {
        self.off(event: handler.0);
      }

      self.socket.disconnect();
    }
  };

  internal func off(event:String) {
    self.socket.off(event);
  };

  internal func channelGet(callback:@escaping ([String:AnyObject]) -> Void){

    self.socket.emitWithAck("channel.get").timingOut(after: 0) {data in
      if let res = data[0] as? [String:AnyObject] {
        callback(res);
      }
    }

  }

  internal func channelJoin(users:NSArray, callback:@escaping ([String:AnyObject]) -> Void){
    var json:[String:AnyObject] = [String:AnyObject]();
    //json["U"] = param.valueForKey("users");
    json["U"] = users;

    self.socket.emitWithAck("channel.join").timingOut(after: 0) {data in
      if let res = data[0] as? [String:AnyObject] {
        callback(res);
      }
    }
  }

  internal func banFromChannel(users:NSArray, callback:@escaping ([String:AnyObject]) -> Void){
    var json:[String:AnyObject] = [String:AnyObject]();
    json["U"] = users;

    self.socket.emitWithAck("channel.ban").timingOut(after: 0) {data in
      if let res = data[0] as? [String:AnyObject] {
        callback(res);
      }
    }
  }

  internal func channelLeave(callback:@escaping ([String:AnyObject]) -> Void){

    self.socket.emitWithAck("channel.leave").timingOut(after: 0) {data in
      if let res = data[0] as? [String:AnyObject] {
        callback(res);
      }
    }
  }
}
