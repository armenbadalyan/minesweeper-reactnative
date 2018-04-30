import React, { PureComponent } from 'react';
import {
  Text,
  View
} from 'react-native';
import LCD from '../lcd/lcd.js';

//import './minecounter.css'

class MineCounter extends PureComponent {

    render() {
        return <LCD style={{}} value={this.props.minesRemaining} />;
    }
}

export default MineCounter;