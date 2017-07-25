'use strict';

import React, {
  Component,
} from 'react';
import {
  Linking,
  Platform,
  ActionSheetIOS,
  Dimensions,
  View,
  Text,
  PushNotificationIOS,
  AlertIOS,
  StyleSheet
} from 'react-native';

import { GiftedChat, Actions, Bubble, Send } from 'react-native-gifted-chat';

import CustomActions from './CustomActions';
import CustomView from './CustomView';

var Communications = require('react-native-communications');
var XPush = require( 'react-native-xpush-client' );

import ActionButton from 'react-native-action-button';


var STATUS_BAR_HEIGHT = 64

var options = {
  title: 'Select Avatar',
  customButtons: {
    'Choose Photo from Facebook': 'fb',
  },
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

var userId = 'user01';
var deviceId = 'web';
XPush.init( 'https://chat.gslook.com:8080', 'messengerx', userId, deviceId );

class Chat extends Component {

  constructor(props) {
    super(props);

    this._isMounted = false;
    this._messages = this.getInitialMessages();

    this.state = {
      messages: this._messages,
      isLoadingEarlierMessages: false,
      typingMessage: '',
      allLoaded: false,
    };

  }

  componentWillMount() {
    // Add listener for local notifications
    PushNotificationIOS.addEventListener('localNotification', this._onLocalNotification);
  }

  componentWillUnmount() {
    // Remove listener for local notifications
    this._isMounted = false;
    PushNotificationIOS.removeEventListener('localNotification', this._onLocalNotification);
  }

  _sendLocalNotification() {
    PushNotificationIOS.presentLocalNotification({
      alertBody: "Testing Application Badge Icon becomes 3!",
      applicationIconBadgeNumber: 3
    });
  }

  _onLocalNotification(notification){

    console.log( notification );
    AlertIOS.alert(
      'Local Notification Received',
      'Alert message: ' + notification.getMessage(),
      [{
        text: 'Dismiss',
        onPress: null,
      }]
    );
  }

  componentDidMount() {

    this._isMounted = true;
    var self = this;

    setTimeout(() => {
      this.setState({
        typingMessage: 'React-Bot is typing a message...',
      });
    }, 1000); // simulating network

    setTimeout(() => {
      this.setState({
        typingMessage: '',
      });

      XPush.join('channel01',['user01','stjune', 'james'], function(data){

        XPush.getInfo('channel01', function(data){
          /**
          setTimeout(() => {
            XPush.leave('channel01', function(data){
              console.log( data );
            });
          }, 1000);
          */

          setTimeout(() => {
            XPush.ban('channel01', ['user01','stjune'], function(data){
              console.log( data );
            });
          }, 1000);

        });
      });

    }, 3000); // simulating network

    XPush.connect( 'channel01', function(err, data){

      XPush.onMessage( function(message){

        // make sure that your message contains :
        self.handleReceive( message );
      });
    });
  }

  getInitialMessages() {
    return [
      {
        _id:0,
        text: 'Are you building a chat app?',
        user:{
          _id :'rb',
          name: 'React-Bot',
          avatar: 'https://facebook.github.io/react/img/logo_og.png',
        },
        position: 'left',
        date: new Date(2016, 3, 14, 13, 0),
        uniqueId: Math.round(Math.random() * 10000), // simulating server-side unique id generation
      },
      {
        _id:1,
        text: "Yes, and I use Gifted Messenger!",
        user:{
          _id :'rb',
          name: 'Awesome Developer',
          avatar: null,
        },
        position: 'right',
        date: new Date(2016, 3, 14, 13, 1),
        uniqueId: Math.round(Math.random() * 10000), // simulating server-side unique id generation
      },
    ];
  }

  setMessageStatus(uniqueId, status) {
    let messages = [];
    let found = false;

    for (let i = 0; i < this._messages.length; i++) {
      if (this._messages[i].uniqueId === uniqueId) {
        let clone = Object.assign({}, this._messages[i]);
        clone.status = status;
        messages.push(clone);
        found = true;
      } else {
        messages.push(this._messages[i]);
      }
    }

    if (found === true) {
      this.setMessages(messages);
    }
  }

  setMessages(messages) {
    this._messages = messages;

    // append the message
    this.setState({
      messages: messages,
    });
  }

  handleSend = (messages = []) => {

    XPush.send( messages[0] );

    // Your logic here
    // Send message.text to your server

    //message.uniqueId = Math.round(Math.random() * 10000); // simulating server-side unique id generation
    //this.setMessages(this._messages.concat(message));

    // mark the sent message as Seen
    //setTimeout(() => {
    //  this.setMessageStatus(message.uniqueId, 'Seen'); // here you can replace 'Seen' by any string you want
    //}, 1000);

    // if you couldn't send the message to your server :
    // this.setMessageStatus(message.uniqueId, 'ErrorButton');
  }

  handleReceive = (message = {})=> {

    this.setState((previousState) => {

      // set latest message !
      var latest = message.text;
      if(message.image){
        latest = '@image';
      }

      return { messages: GiftedChat.append(previousState.messages, message) };
    });
  }

  // will be triggered when the Image of a row is touched
  onImagePress(message = {}) {
    // Your logic here
    // Eg: Navigate to the user profile
  }

  renderCustomActions =(props)=> {
    if (Platform.OS === 'ios') {
      return (
        <CustomActions
          {...props}
          handleImage={this.handleImage}
        />
      );
    }
    const options = {
      'Action 1': (props) => {
        alert('option 1');
      },
      'Action 2': (props) => {
        alert('option 2');
      },
      'Cancel': () => {},
    };
    return (
      <Actions
        {...props}
        options={options}
      />
    );
  }

  renderFooter =(props)=> {
    if (this.state.typingText) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            {this.state.typingText}
          </Text>
        </View>
      );
    }
    return null;
  }

  render() {
    return (
        <GiftedChat
          ref="ChatBox"
          messages={this.state.messages}
          onSend={this.handleSend}

          user={{
            _id: '_sender', // sent messages should have same user._id
            name: 'Awesome Developer',
            avatar: null
          }}

          renderActions={this.renderCustomActions}
          renderFooter={this.renderFooter}
        />
    );
  }

  handleUrlPress(url) {
    Linking.openURL(url);
  }

  // TODO
  // make this compatible with Android
  handlePhonePress(phone) {
    if (Platform.OS !== 'android') {
      var BUTTONS = [
        'Text message',
        'Call',
        'Cancel',
      ];
      var CANCEL_INDEX = 2;

      ActionSheetIOS.showActionSheetWithOptions({
        options: BUTTONS,
        cancelButtonIndex: CANCEL_INDEX
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            Communications.phonecall(phone, true);
            break;
          case 1:
            Communications.text(phone);
            break;
        }
      });
    }
  }

  handleImage=(images)=>{

    console.log( images );

    /**
    XPush.sendImage( response.uri,
      function( progress ){
        console.log( progress );
      },function( err, result ){
        console.log( result );
      }
    );
    */
  }

}

const styles = StyleSheet.create({
  footerContainer: {
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#aaa',
  },
});

module.exports = Chat;
