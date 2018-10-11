import React, { PureComponent } from 'react';
import LCD from './LCD';

class MineCounter extends PureComponent {

    render() {
        return <LCD style={{}} value={this.props.minesRemaining} />;
    }
}

export default MineCounter;