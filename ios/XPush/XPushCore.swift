//
//  XPush.swift
//  XPush
//
//  Created by James Jung on 2016. 5. 29..
//  Copyright © 2016년 xpush. All rights reserved.
//

import Foundation

@objc(XPushCore)
class XPushCore: NSObject {
    
    var channelCore: ChannelCore!
    var connectionSocket: String!
    var bridge: RCTBridge!
    var connectionSuccessCallback: RCTResponseSenderBlock!
  
    /**
     * Construct and expose RCTBridge to module
     */
    
    @objc func initWithBridge(_bridge: RCTBridge) {
      self.bridge = _bridge
    }
    
    /**
     * Initialise and configure socket
     */
    @objc func initialise() -> Void {
    }
  
    @objc func connect(config: NSDictionary, callback: RCTResponseSenderBlock) -> Void {
        
        // Connect to socket with config
        self.channelCore = ChannelCore( mAppId: config.valueForKey("appId") as! String, mUserId: config.valueForKey("userId") as! String, mDeviceId: config.valueForKey("deviceId") as! String, mChannelId: config.valueForKey("channel") as! String, mServerUrl: config.valueForKey("url") as! String, mServerName: config.valueForKey("name") as! String  );
      
        connectionSuccessCallback = callback;
      
        self.channelCore.connect(connectionSuccessCallback);
    }
  
    @objc func send(message: String){
      self.channelCore.send(message);
    }
}
