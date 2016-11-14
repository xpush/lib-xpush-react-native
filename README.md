# lib-xpush-react-native

[xpush-chat](https://github.com/xpush/xpush-chat) client for React Native

##About XPUSH

http://xpush.github.io/about/

## Installation

```
% npm i https://github.com/xpush/lib-xpush-react-native.git
```

### iOS

Tested in React-Native 0.35 ~ 0.37

1. Open up your project in xcode and right click the package.
 - Click **Add files to 'Your project name'**
 - Navigate to **/node_modules/react-native-xpush-client/ios/XPush/**
 - Drag all files in `XPush` folder
 - Click 'Add'
 - Then you will see a popup like this, click *Create Brdiging Header*
 ![Bridging Header](http://static.stalk.io/images/bh.png)

2. Click your project in the navigator on the left and go to **build settings**
 - 
 - Search for **swift** in `Build Settings`
 - Double click on **Objective-C Bridging Header** column
 - Enter **../node_modules/react-native-xpush-client/ios/XPush/XPushBridge.h**

> If you can't find **Objective-C Bridging Header** option in *Build Settings*, follow just below
 - Create a new file `YourAppName.swift` or `YourModuleName.swift` in YourAppName folder
 - Then you will see a popup like [this](http://static.stalk.io/images/bh.png), click *Create Brdiging Header*
 - Finally search and modify **Objective-C Bridging Header** option to **../node_modules/react-native-xpush-client/ios/XPush/XPushBridge.h**

### Android

1. add the following import to `MainActivity.java` of your application

```java
import com.facebook.react.shell.MainReactPackage;
```

2. add the following code to add the package to `MainActivity.java`

```java
    protected List<ReactPackage> getPackages() {
        return Arrays.<ReactPackage>asList(
            new MainReactPackage(),
                new XPushPackage() //this
        );
    }
```

3. add the following codes to your `android/setting.gradle`

> you might have multiple 3rd party libraries, make sure that you don't create multiple include.

```
include ':app', ':xpush-client'
project(':xpush-client').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-xpush-client/android/lib')
```

4. edit `android/app/build.gradle` and add the following line inside `dependencies`

```
compile project(':react-native-xpush-client')
```

5. run `react-native run-android` to see if everything is compilable.

### Usage

```javascript
var XPush = require( 'react-native-xpush-client' );

// setting for xpush server
XPush.init( 'http://54.178.160.166:8000', 'yourAppId', userId, deviceId );

// connect to the `channel01`
XPush.connect( 'channel01', function(err, data){

  XPush.onMessage( function( data ){
  	// handle message
  	console.log( data );
  });

  // send message after channel connect
  XPush.send( 'hello' );
});
```