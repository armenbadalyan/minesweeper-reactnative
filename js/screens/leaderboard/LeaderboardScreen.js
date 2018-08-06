import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import { connect } from 'react-redux';
import { updateLevel, updatePeriod, fetchLeaders, RankingPeriod } from '../../modules/leaderboard';
import { DifficultyLevel } from '../../modules/game';
import Button from '../../components/Button';
import GameText from '../../components/GameText';
import { BG_MAIN_COLOR } from '../../constants';
import commonStyles from '../../shared/styles'

const mapStateToProps = state => ({
	auth: state.auth,
	leaderboard: state.leaderboard
});

const mapDispatchToProps = dispatch => ({
	updateLevel: (level) => {
		return dispatch(updateLevel(level));
	},
	updatePeriod: (period) => {
		return dispatch(updatePeriod(period));
	},
	fetchLeaders: (level, period) => {
		return dispatch(fetchLeaders(level, period));
	}
});

const levels = [
	{ id: DifficultyLevel.BEGINNER, name: 'Beginner' },
	{ id: DifficultyLevel.INERMEDIATE, name: 'Intermediate' }
];

const periods = [
	{ id: RankingPeriod.OVERALL, name: 'Overall' },
	{ id: RankingPeriod.WEEKLY, name: 'Weekly' },
	{ id: RankingPeriod.DAILY, name: 'Daily' }
];

export class LeaderboardScreen extends Component {

	componentDidMount() {
		const { selectedLevel, selectedPeriod } = this.props.leaderboard;
		this.props.fetchLeaders(selectedLevel, selectedPeriod);
	}

	getLevelIndex(levelId) {
		return levels.findIndex(level => level.id === levelId);
	}

	getLevelLabel(levelId) {
		const level = levels.find(level => level.id === levelId);
		if (level) {
			return level.name;
		}
		else {
			return '';
		}
	}

	getPeriodIndex(periodId) {
		return periods.findIndex(period => period.id === periodId);
	}

	getPeriodLabel(periodId) {
		const period = periods.find(period => period.id === periodId);
		if (period) {
			return period.name;
		}
		else {
			return '';
		}
	}

	onLevelSelected = (index, value) => {
		this.props.updateLevel(value.id);
	}

	onPeriodSelected = (index, value) => {
		this.props.updatePeriod(value.id);
	}

	renderOptionRow = (data, id, highlighted) => {
		return (<Button title={data.name}
			style={styles.filterButton}
			titleStyle={styles.filterButtonTitle}
			touchable={false}
			selected={highlighted} />);
	}


	render() {
		return (<View style={styles.screen}>
			<View style={[styles.header, commonStyles.border]}>
				<Button title="<" onPress={() => { this.props.navigation.goBack() }} />
				<View style={styles.filter}>
					<GameText style={styles.headerText}>Level</GameText>
					<ModalDropdown ref={ref => this.levelDD = ref} style={{ flex: 1 }}
						dropdownStyle={{ height: 'auto' }}
						options={levels}
						defaultIndex={this.getLevelIndex(this.props.leaderboard.selectedLevel)}
						renderRow={this.renderOptionRow}
						onSelect={this.onLevelSelected}>
						<Button title={this.getLevelLabel(this.props.leaderboard.selectedLevel)} style={styles.filterButton} titleStyle={styles.filterButtonTitle}
							onPress={() => { this.levelDD.show() }} />
					</ModalDropdown>
				</View>
				<View style={styles.filter}>
					<GameText style={styles.headerText}>Period</GameText>
					<ModalDropdown ref={ref => this.periodDD = ref} style={{ flex: 1 }}
						dropdownStyle={{ height: 'auto' }}
						options={periods}
						defaultIndex={this.getPeriodIndex(this.props.leaderboard.selectedPeriod)}
						renderRow={this.renderOptionRow}
						onSelect={this.onPeriodSelected}>
						<Button title={this.getPeriodLabel(this.props.leaderboard.selectedPeriod)} style={styles.filterButton} titleStyle={styles.filterButtonTitle}
							onPress={() => { this.periodDD.show() }} />
					</ModalDropdown>
				</View>

			</View>
			<View style={[commonStyles.border, styles.leaderboard]}>

			</View>

		</View>);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(LeaderboardScreen);

LeaderboardScreen.propTypes = {
	leaderboard: PropTypes.shape({
		selectedLevel: PropTypes.string,
		selectedPeriod: PropTypes.string,
		leaders: PropTypes.arrayOf(PropTypes.shape({
			user: PropTypes.object,
			rank: PropTypes.number
		}))
	}),
	fetchLeaders: PropTypes.func,
	updateLevel: PropTypes.func,
	updatePeriod: PropTypes.func,
	navigation: PropTypes.any,
	style: PropTypes.any
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'stretch',
		backgroundColor: BG_MAIN_COLOR,
		padding: 12
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 10
	},
	headerText: {
		fontSize: 10
	},
	leaderboard: {
		flex: 1
	},
	filter: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center'
	},
	filterButton: {
		flex: 1,
		fontSize: 10
	},
	filterButtonTitle: {
		fontSize: 10
	}
});
