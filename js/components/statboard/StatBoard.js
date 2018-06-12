import React, { PureComponent } from 'react';
import {
	View,
	StyleSheet,
	TouchableHighlight
} from 'react-native';
import Timer from '../timer/timer.js';
import MineCounter from '../minecounter/minecounter.js';
import Icon from '../icon/icon.js';
import commonStyles from '../../shared/styles.js'


export default class StatBoard extends PureComponent {

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
			<View style={styles.buttons}>
				<TouchableHighlight onPress={this.props.onGameButtonPressed}>
					<View style={styles.iconButton}>
						<Icon source={buttonAsset} />
					</View>
				</TouchableHighlight>
				<TouchableHighlight onPress={this.props.onMenuButtonPressed}>
					<View style={styles.iconButton}>
						<Icon source='list' />
					</View>
				</TouchableHighlight>
			</View>			
			<MineCounter minesRemaining={minesRemaining} />
		</View>
	}
}

const styles = StyleSheet.create({
	statboard: {
		width: '100%',
		flexDirection: 'row',
		flexWrap: 'nowrap',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 10
	},
	buttons: {
		flexDirection: 'row',
		flexWrap: 'nowrap'
	},
	iconButton: {
		backgroundColor: '#C0C0C0',
		width: 40,
		height: 40,
		borderWidth: 3,
		borderStyle: 'solid',
		borderLeftColor: '#fff',
		borderTopColor: '#fff',
		borderRightColor: '#808080',
		borderBottomColor: '#808080',
		padding: 4
	}
});