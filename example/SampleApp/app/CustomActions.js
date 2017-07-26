import React from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Dimensions
} from 'react-native';

import CameraRollPicker from 'react-native-camera-roll-picker';

export default class CustomActions extends React.Component {
  constructor(props) {
    super(props);
    this._images = [];
    this.state = {
      modalVisible: false,
    };
  }

  setImages(images) {
    this._images = images;
  }

  getImages() {
    return this._images;
  }

  setModalVisible(visible = false) {
    this.setState({modalVisible: visible});
  }

  onActionsPress =()=> {
    const options = ['Choose From Library', 'Send Location', 'Cancel'];
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions({
      options,
      cancelButtonIndex,
    },
    (buttonIndex) => {
      switch (buttonIndex) {
        case 0:
          this.setModalVisible(true);
          break;
        case 1:
          navigator.geolocation.getCurrentPosition(
            (position) => {
              this.props.onSend({
                location: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                },
              });
            },
            (error) => alert(error.message),
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
          );
          break;
        default:
      }
    });
  }

  selectImages =(images)=> {
    this.setImages(images);
  }

  renderIcon() {
    if (this.props.icon) {
      return this.props.icon();
    }
    return (
      <View
        style={[styles.wrapper, this.props.wrapperStyle]}
      >
        <Text
          style={[styles.iconText, this.props.iconTextStyle]}
        >
          +
        </Text>
      </View>
    );
  }

  onClose =()=> {
    this.setModalVisible(false);
  }

  onSelectImage = ()=> {
    this.setModalVisible(false);
    if( this.props.handleImage ){
      this.props.handleImage( this.getImages() );
    }
  }

  render() {
    var self = this;
    return (
      <TouchableOpacity
        style={[styles.container, this.props.containerStyle]}
        onPress={this.onActionsPress}
      >
        <Modal
          animationType={'slide'}
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setModalVisible(false);
          }}
        >
          <View style={styles.nav}>
            <TouchableOpacity
              onPress={this.onClose}
            >
              <Text
                style={styles.buttonLeftText}
              >
                Close
              </Text>
            </TouchableOpacity>
            <View style={{flex:1}}/>
            <TouchableOpacity
              onPress={this.onSelectImage}
            >
              <Text
                style={styles.buttonRightText}
              >
                Select
              </Text>
            </TouchableOpacity>
          </View>
          <CameraRollPicker
            maximum={10}
            imagesPerRow={4}
            callback={self.selectImages}
            selected={[]}
          />
        </Modal>
        {this.renderIcon()}
      </TouchableOpacity>
    );
  }
}

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  nav:{
    height:64,
    width:windowWidth,
    flexDirection:'row'
  },
  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
  buttonLeftText: {
    color: '#157efb',
    fontSize: 16,
    justifyContent:'center',
    textAlign: 'left',
    paddingTop:20,
    paddingLeft:10,
    lineHeight:44
  },
  buttonRightText: {
    color: '#157efb',
    fontSize: 16,
    justifyContent:'center',
    textAlign: 'right',
    paddingTop:20,
    paddingRight:10,
    lineHeight:44
  },
});

CustomActions.contextTypes = {
  actionSheet: React.PropTypes.func,
};

CustomActions.defaultProps = {
  onSend: () => {},
  options: {},
  icon: null,
  containerStyle: {},
  wrapperStyle: {},
  iconTextStyle: {},
};

CustomActions.propTypes = {
  onSend: React.PropTypes.func,
  options: React.PropTypes.object,
  icon: React.PropTypes.func,
  containerStyle: View.propTypes.style,
  wrapperStyle: View.propTypes.style,
  iconTextStyle: Text.propTypes.style,
};
