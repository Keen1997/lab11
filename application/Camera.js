import React from 'react';
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import { StyleSheet, Text, View, Alert, TouchableOpacity, CameraRoll } from 'react-native';
import { Ionicons, FontAwesome, MaterialCommunityIcons, Entypo } from '@expo/vector-icons'

const landmarkSize = 6

export default class App extends React.Component {
  state = {
    hasCameraPermission: null,
    hasCameraRollPermission: null,
    type: Camera.Constants.Type.front,
    captureMode: 'photo',
    videoRecording: false,
    flashMode: 'off',
    faceDetecting: false,
    faces: [],
  }

  componentDidMount() {
    this.askForPermission()
  }

  askForPermission = async () => {
    await Permissions.askAsync(Permissions.CAMERA);
    const { status } = await Permissions.getAsync(Permissions.CAMERA)

    this.setState({ hasCameraPermission: status === 'granted' });

    await Permissions.askAsync(Permissions.CAMERA_ROLL);
    const { status2 } = await Permissions.getAsync(Permissions.CAMERA_ROLL)

    this.setState({ hasCameraRollPermission: status2 === 'granted' });
  }

  changeCaptureMode(mode) {
    this.setState({
      captureMode: mode,
      videoRecording: false
    })
  }

  swapFlashMode() {
    if (this.state.flashMode === 'off') this.setState({ flashMode: 'on' })
    else this.setState({ flashMode: 'off' })
  }

  swapFaceDetector() {
    if (this.state.faceDetecting === false) this.setState({ faceDetecting: true })
    else this.setState({ faceDetecting: false })
  }

  takePhoto = async () => {
    if (this.refs.camera) {
      let photo = await this.refs.camera.takePictureAsync()
      // Alert.alert(photo.uri)

      CameraRoll.saveToCameraRoll(photo.uri).then(() => Alert.alert('already save to camera roll'))
    }
  }

  startRecordVideo = async () => {
    await this.setState({ faceDetecting: false })
    if (this.refs.camera) {
      this.setState({ 
        videoRecording: true
      })
      let video = await this.refs.camera.recordAsync();
      
      CameraRoll.saveToCameraRoll(video.uri).then(() => Alert.alert('already save to camera roll'))
    }
  }

  stopRecordVideo = async () => {
    if (this.refs.camera) {
      this.setState({ videoRecording: false })
      await this.refs.camera.stopRecording();
    }
  }

  onFacesDetected = ({ faces }) => this.setState({ faces })

  renderFace({ bounds, faceID, rollAngle, yawAngle, smilingProbability }) {
    return (
      <View
        key={faceID}
        transform={[
          { perspective: 600 },
          { rotateZ: `${rollAngle.toFixed(0)}deg` },
          { rotateY: `${yawAngle.toFixed(0)}deg` },
        ]}
        style={[
          styles.face,
          {
            ...bounds.size,
            left: bounds.origin.x,
            top: bounds.origin.y,
          },
        ]}>
        <Text style={styles.faceText}>Roll: {rollAngle.toFixed(0)}</Text>
        <Text style={styles.faceText}>Yaw: {yawAngle.toFixed(0)}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Entypo name="emoji-happy" size={24} color="#fff" />
          <Text style={styles.faceText}>: {(smilingProbability*100).toFixed(0)}%</Text>
        </View>
        
      </View>
    )
  }

  renderLandmarksOfFace(face) {
    const renderLandmark = position =>
      position && (
        <View
          style={[
            styles.landmark,
            {
              left: position.x - landmarkSize / 2,
              top: position.y - landmarkSize / 2,
            },
          ]}
        />
      )
    return (
      <View key={`landmarks-${face.faceID}`}>
        {renderLandmark(face.leftEyePosition)}
        {renderLandmark(face.rightEyePosition)}
        {renderLandmark(face.leftEarPosition)}
        {renderLandmark(face.rightEarPosition)}
        {renderLandmark(face.leftCheekPosition)}
        {renderLandmark(face.rightCheekPosition)}
        {renderLandmark(face.leftMouthPosition)}
        {renderLandmark(face.mouthPosition)}
        {renderLandmark(face.rightMouthPosition)}
        {renderLandmark(face.noseBasePosition)}
        {renderLandmark(face.bottomMouthPosition)}
      </View>
    )
  }

  renderFaces = () =>
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.faces.map(this.renderFace)}
    </View>

  renderLandmarks = () =>
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.faces.map(this.renderLandmarksOfFace)}
    </View>

  renderFlashButton() {
    return this.state.flashMode === 'on' ?
      <Ionicons name="ios-flash" size={32} color="#fff" /> :
      <Ionicons name="ios-flash-off" size={32} color="#fff" />
  }

  renderFaceDetectionButton() {
    return this.state.faceDetecting === true ?
      <Entypo name="emoji-happy" size={32} color="#fff" /> :
      <FontAwesome name="user-secret" size={32} color="#fff" />
  }

  renderCaptureButton() {
    if (this.state.captureMode === 'photo') {
      return (
        <TouchableOpacity
          style={{ margin: 20 }}
          onPress={() => this.takePhoto()}>
          <FontAwesome name="circle-thin" size={75} color="white" />
        </TouchableOpacity>

      )
    } else if (this.state.captureMode === 'video') {
      if (!this.state.videoRecording) {
        return (
          <TouchableOpacity
            style={{ margin: 20 }}
            onPress={() => this.startRecordVideo()}>
            <MaterialCommunityIcons name="circle-slice-8" size={75} color="#fff" />
          </TouchableOpacity>
        )
      } else {
        return (
          <TouchableOpacity
            style={{ margin: 20 }}
            onPress={() => this.stopRecordVideo()}>
            <MaterialCommunityIcons name="circle-slice-8" size={75} color="#f55" />
          </TouchableOpacity>
        )
      }

    }
  }

  renderCamera() {
    return (
      <View style={{ flex: 1 }}>
        <Camera
          style={{ flex: 1 }}
          type={this.state.type}
          ref="camera"
          flashMode={this.state.flashMode}
          onFacesDetected={this.state.faceDetecting ? this.onFacesDetected : undefined}
          faceDetectorSettings={{
            mode: FaceDetector.Constants.Mode.accurate,
            detectLandmarks: FaceDetector.Constants.Landmarks.all,
            runClassifications: FaceDetector.Constants.Classifications.all,
            minDetectionInterval: 100,
            tracking: true,
          }}
        >
          <View style={{ flex: 0.125, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>

            <TouchableOpacity style={{ margin: 20 }} onPress={() => this.swapFlashMode()}>
              {this.renderFlashButton()}
            </TouchableOpacity>

            <TouchableOpacity style={{ margin: 20 }} onPress={() => this.swapFaceDetector()}>
              {this.renderFaceDetectionButton()}
            </TouchableOpacity>

          </View>

          <View style={{ flex: 0.85, justifyContent: 'flex-end' }}>
            
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>

              <TouchableOpacity onPress={() => this.changeCaptureMode('photo')}>
                <Text style={{ color: this.state.captureMode === 'photo' ? '#ffd700' : '#fff', fontSize: 16 }}>PHOTO</Text>
              </TouchableOpacity>

              <View style={{ width: 25, height: 24 }}></View>

              <TouchableOpacity onPress={() => this.changeCaptureMode('video')}>
                <Text style={{ color: this.state.captureMode === 'video' ? '#ffd700' : '#fff', fontSize: 16 }}>VIDEO</Text>
              </TouchableOpacity>

            </View>

            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

              <TouchableOpacity
                style={{ margin: 20 }}
                onPress={() => this.props.changeScreen('imagePicker')}>
                <MaterialCommunityIcons name="image-multiple" size={40} color="#fff" />
              </TouchableOpacity>

              {this.renderCaptureButton()}

              <TouchableOpacity
                style={{ margin: 20 }}
                onPress={() => {
                  this.setState({
                    type: this.state.type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front : Camera.Constants.Type.back,
                  })
                }}>
                <Ionicons name="ios-reverse-camera" size={50} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

        </Camera>

        {this.state.faceDetecting && this.renderFaces()}
        {this.state.faceDetecting && this.renderLandmarks()}
      </View>

    )
  }

  render() {
    if (this.state.hasCameraPermission === null) {
      return <View />
    } else if (this.state.hasCameraPermission === false) {
      Alert.alert('No access to camera')
      return <View style={styles.container}><Text>No access to camera</Text></View>
    } else {
      return this.renderCamera()
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  face: {
    padding: 0,
    borderWidth: 2,
    borderRadius: 12,
    position: 'absolute',
    borderColor: '#ddd',
    justifyContent: 'center',
  },
  landmark: {
    width: landmarkSize,
    height: landmarkSize,
    position: 'absolute',
    backgroundColor: '#4285F4',
    borderRadius: 4
  },
  faceText: {
    color: '#ddd',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    backgroundColor: 'transparent',
  },
})