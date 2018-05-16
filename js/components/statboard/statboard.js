import React, { PureComponent } from 'react';
import {
	Text,
	View,
	Image,
	TouchableHighlight
} from 'react-native';
import Timer from '../timer/timer.js';
import MineCounter from '../minecounter/minecounter.js';
import Icon from '../icon/icon.js';
import styles from './styles.js';
import commonStyles from '../../shared/styles.js'


class StatBoard extends PureComponent {

	render() {

		let buttonAsset,
			minesRemaining = this.props.game.totalMines - this.props.flaggedMines;

		switch (this.props.game.status) {
			case 'won':
				buttonAsset = 'face_win';
				break;
			case 'lost':
				buttonAsset = 'face_lost';
				break;
			default:
				buttonAsset = 'face_alive';
		}

		return <View style={[commonStyles.border, styles.statboard]} className="statboard game__border">
			<Timer startedAt={this.props.game.startedAt} status={this.props.game.status} />
			<TouchableHighlight onPress={this.props.onGameButtonClick}>
				<View style={styles.startButton}>
					<Icon source={buttonAsset} />
				</View>
			</TouchableHighlight>
			<MineCounter minesRemaining={minesRemaining} />
		</View>
	}
}

export default StatBoard;