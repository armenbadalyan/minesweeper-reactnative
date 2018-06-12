import React, { PureComponent } from 'react';
import {
  Text,
  View
} from 'react-native';
import LCD from '../lcd/LCD';

class MineCounter extends PureComponent {

    render() {
        return <LCD style={{}} value={this.props.minesRemaining} />;
    }
}

export default MineCounter;