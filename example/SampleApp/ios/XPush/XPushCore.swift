//
//  XPush.swift
//  XPush
//
//  Created by James Jung on 2016. 5. 29..
//  Copyright © 2016년 xpush. All rights reserved.
//

import Foundation

@objc(XPushCore)
class XPushCore: RCTEventEmitter {
    
  var channelCore: ChannelCore!
  var connectionSocket: String!
  var connectionSuccessCallback: RCTResponseSenderBlock!
  
  var onMessage: NormalCallback!
  var onConnectSuccess: NormalCallback!
  var onConnectError: NormalCallback!
  var onConnectTimeout: NormalCallback!
  
  /**
    * Initialise and configure socket
  */
  func initHanlder() -> Void {
      
    self.onConnectSuccess = {data, ack in
      if self.connectionSuccessCallback != nil {
        self.connectionSuccessCallback!(["success"]);
        self.connectionSuccessCallback = nil;
      }
    };
      
    self.onConnectError = {data, ack in
      if self.connectionSuccessCallback != nil {
        self.connectionSuccessCallback!(["error"]);
        self.connectionSuccessCallback = nil;
      } else {
        if let dt = data[0] as? [String:AnyObject] {
          self.sendEvent(withName: "xpush:connect_error", body: dt);
        }
      }
    };
    
    self.onConnectTimeout = {data, ack in
      if self.connectionSuccessCallback != nil {
        self.connectionSuccessCallback!(["error"]);
        self.connectionSuccessCallback = nil;
      }
    };
    
      
    self.onMessage = {data, ack in
      if let dt = data[0] as? [String:AnyObject] {
        self.sendEvent(withName: "xpush:message", body: dt)
      }
    };
  }
  
  // Event list for Handling RCTEvent
  override func supportedEvents() -> [String]! {
    return ["xpush:message", "xpush:connect_error"]
  }
  
  @objc func connect(config: NSDictionary, callback: @escaping RCTResponseSenderBlock) -> Void {
    initHanlder();
    
    // Connect to socket with config
    self.channelCore = ChannelCore( mAppId: config.value(forKey: "appId") as! String, mUserId: config.value(forKey: "userId") as! String, mDeviceId: config.value(forKey: "deviceId") as! String, mChannelId: config.value(forKey: "channel") as! String, mServerUrl: config.value(forKey: "url") as! String, mServerName: config.value(forKey: "name") as! String  );
    
    self.connectionSuccessCallback = callback;
      
    var handlers = [String:NormalCallback]();
    handlers["connect"] = self.onConnectSuccess;
    handlers["error"] = self.onConnectError;
    handlers["message"] = self.onMessage;
    self.channelCore.connect(handlers: handlers);
  }
  
  @objc func send(message: String){
    self.channelCore.send(message: message);
  }
  
  @objc func sendWithData(data:NSDictionary){
    var parsed :[String:AnyObject] = [String:AnyObject]();
    for ( key, value) in data {
      if let dateVal = value as? NSDate {
        NSLog( "date format parsing ")
        parsed[key as! String] = UInt64(dateVal.timeIntervalSince1970 * 1000 ) as AnyObject?;
      } else {
        parsed[key as! String] = value as AnyObject?;
      }
    }
    self.channelCore.sendWithData(param: parsed);
  }
  
  @objc func getChannelInfo(callback: @escaping RCTResponseSenderBlock){
    
    func cb(data:[String:AnyObject]) -> Void {
      callback([data]);
    };
    
    self.channelCore.channelGet(callback: cb);
  }

  @objc func joinChannel(users:NSArray, callback: @escaping RCTResponseSenderBlock){
    
    func cb(res:[String:AnyObject]) -> Void {
      callback([res]);
    };
    
    self.channelCore.channelJoin(users: users,callback: cb);
  }

  @objc func banFromChannel(users:NSArray, callback: @escaping RCTResponseSenderBlock){
    
    func cb(res:[String:AnyObject]) -> Void {
      callback([res]);
    };
    
    self.channelCore.banFromChannel(users: users,callback: cb);
  }
  
  @objc func leaveChannel(callback: @escaping RCTResponseSenderBlock){
    
    func cb(res:[String:AnyObject]) -> Void {
      callback([res]);
    };
    
    self.channelCore.channelLeave(callback: cb);
  }
  
  @objc func disconnect(){
    self.channelCore.disconnect();
  }

}
