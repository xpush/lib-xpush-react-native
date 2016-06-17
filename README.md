# lib-xpush-react-native

xpush client for React Native

##About XPUSH

http://xpush.github.io/about/

## Installation

```
% npm i https://github.com/xpush/lib-xpush-react-native.git
```

### iOS

1. Open up your project in xcode and right click the package.
 - Click **Add files to 'Your project name'**
 - Navigate to **/node_modules/react-native-xpush-client/ios**
 - Click 'Add'
 - Click your project in the navigator on the left and go to **build settings**

2. Search for **Objective-C Bridging Header**
 - Double click on the empty column
 - Enter **node_modules/react-native-xpush-client/ios/XPushBridge.h**

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

```
var XPush = require( 'react-native-xpush-client' );

// setting for server
XPush.init( 'http://54.178.160.166:8000', 'messengerx', userId, deviceId );
XPush.send( 'messageText' );
```