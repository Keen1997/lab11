import React from 'react';
import Camera from './Camera'
import ImagePicker from './ImagePicker'

export default class App extends React.Component {
  state = {
    screen: 'camera'
  }

  render() {
    if (this.state.screen === 'camera') return <Camera changeScreen = {screen => this.setState({ screen })} />
    else if (this.state.screen === 'imagePicker') return <ImagePicker changeScreen = {screen => this.setState({ screen })} />
  }
}