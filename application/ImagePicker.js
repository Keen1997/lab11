import * as React from 'react';
import { Image, View, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import { FontAwesome, Entypo } from '@expo/vector-icons'

export default class ImagePickerExample extends React.Component {
  state = {
    image: null,
    imageGrey: null
  }

  componentDidMount() {
    this.getPermissionAsync();
  }

  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  }

  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      base64: true
    })

    if (!result.cancelled) {
      this.setState({ image: result.uri })

      fetch('https://us-central1-mobile-lab10.cloudfunctions.net/uploadImage', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          base64: result.base64
        })
      }).then((res) => {
        return res.text()
      }).then(text => {
        this.setState({ imageGrey: text })
      })
    }
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>

          <TouchableOpacity onPress={() => this.props.changeScreen('camera')} style={{ marginBottom: 24 }}>
            <FontAwesome name="camera-retro" size={40} />
          </TouchableOpacity>

          <View style={{ width: 50 }}></View>
          <TouchableOpacity onPress={this._pickImage} style={{ marginBottom: 24 }}>
            <Entypo name="folder-images" size={42} />
          </TouchableOpacity>
          
        </View>

        {this.state.image &&
          <Image source={{ uri: this.state.image }} style={styles.image} />}
        {this.state.imageGrey &&
          <Image source={{ uri: this.state.imageGrey }} style={styles.image} />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 300,
    marginTop: 20
  }
})