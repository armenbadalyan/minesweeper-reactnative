import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
	View,
	StyleSheet,
	TouchableHighlight,
	ViewPropTypes as RNViewPropTypes
} from 'react-native';
import Timer from './Timer';
import MineCounter from './MineCounter';
import Icon from './Icon';
import commonStyles from '../shared/styles';
import faceWin from '../assets/face_win.png';
import faceLost from '../assets/face_lost.png';
import faceAlive from '../assets/face_alive.png';

const ViewPropTypes = RNViewPropTypes || View.propTypes;

export default class StatBoard extends PureComponent {

	render() {

		let buttonAsset,
			minesRemaining = this.props.game.totalMines - this.props.flaggedMines;

		switch (this.props.game.status) {
			case 'won':
				buttonAsset = faceWin;
				break;
			case 'lost':
				buttonAsset = faceLost;
				break;
			default:
				buttonAsset = faceAlive;
		}

		return <View style={[
			commonStyles.border, styles.statboard, 
			this.props.isVertical ? styles.statboardVertical: styles.statboardHorizontal, 
			this.props.style]}>
			<Timer startedAt={this.props.game.startedAt} finishedAt={this.props.game.finishedAt} status={this.props.game.status} />
			<View style={[styles.buttons, this.props.isVertical ? styles.buttonsVertical: styles.buttonsHorizontal]}>
				<TouchableHighlight onPress={this.props.onGameButtonPressed}>
					<View style={styles.iconButton}>
						<Icon source={buttonAsset} externalSource={true} width={40} height={40} />
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

StatBoard.propTypes = {
	game: PropTypes.shape({
		totalMines: PropTypes.number,
		status: PropTypes.string,
		startedAt: PropTypes.number,
		finishedAt: PropTypes.finishedAt
	}),
	isVertical: PropTypes.bool,
	flaggedMines: PropTypes.number,
	style: ViewPropTypes.style,
	onGameButtonPressed: PropTypes.func,
	onMenuButtonPressed: PropTypes.func
}

const styles = StyleSheet.create({
	statboard: {		
		flexWrap: 'nowrap',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 10
	},
	statboardHorizontal: {
		flexDirection: 'row'
	},
	statboardVertical: {	
		flexDirection: 'column'
	},
	buttons: {		
		flexWrap: 'nowrap'
	},
	buttonsHorizontal: {
		flexDirection: 'row'
	},
	buttonsVertical: {
		flexDirection: 'column'
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