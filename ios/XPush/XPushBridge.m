//
//  XPushBridget.m
//  XPush
//
//  Created by James Jung on 2016. 5. 29..
//  Copyright © 2016년 xpush. All rights reserved.
//

#import <Foundation/Foundation.h>

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(XPushCore, NSObject)

RCT_EXTERN_METHOD(connect:(NSDictionary*)config callback:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(sendText:(NSString*)message)
RCT_EXTERN_METHOD(sendData:(NSDictionary*)data)
RCT_EXTERN_METHOD(disconnect)
RCT_EXTERN_METHOD(getChannelInfo:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(joinChannel:(NSArray*)users callback:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(banFromChannel:(NSArray*)users callback:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(leaveChannel:(RCTResponseSenderBlock)callback)



@end