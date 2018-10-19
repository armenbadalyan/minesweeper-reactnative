import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, FlatList, StyleSheet } from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import { connect } from 'react-redux';
import { updateLevel, updatePeriod, fetchLeaders, RankingPeriod } from '../../modules/leaderboard';
import RankRow from './RankRow';
import RankSeparator from './RankSeparator';
import { DifficultyLevel } from '../../modules/game';
import Button from '../../components/Button';
import GameText from '../../components/GameText';
import { BG_MAIN_COLOR } from '../../constants';
import commonStyles from '../../shared/styles'

const mapStateToProps = state => ({
	user: state.auth.user,
	highscores: state.score.bestScore,
	leaders: state.leaderboard.leaders,
	playerRank: state.leaderboard.playerRank,
	selectedLevel: state.leaderboard.selectedLevel,
	selectedPeriod: state.leaderboard.selectedPeriod
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
	{ id: DifficultyLevel.INTERMEDIATE, name: 'Intermediate' },
	{ id: DifficultyLevel.EXPERT, name: 'Expert' }
];

const periods = [
	{ id: RankingPeriod.OVERALL, name: 'Overall' },
	{ id: RankingPeriod.WEEKLY, name: 'Weekly' },
	{ id: RankingPeriod.DAILY, name: 'Daily' }
];

export class LeaderboardScreen extends Component {

	componentDidMount() {
		this.props.fetchLeaders(this.props.selectedLevel, this.props.selectedPeriod);
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
		this.props.fetchLeaders(value.id, this.props.selectedPeriod);
	}

	onPeriodSelected = (index, value) => {
		this.props.updatePeriod(value.id);
		this.props.fetchLeaders(this.props.selectedLevel, value.id);
	}

	getRows() {
		const leaderCount = this.props.leaders.length,
			playerRank = this.props.playerRank,
			highscore = this.props.highscores[this.props.selectedLevel];			

		if (playerRank && highscore) {
			const currentPlayerRank = highscore ? {
				rank: playerRank,
				score: {
					score: highscore.score,
					user: this.props.user
				}
			} : null;

			if (playerRank <= leaderCount) {
				return this.props.leaders;
			}
			else if (playerRank == leaderCount + 1) {
				return [...this.props.leaders, currentPlayerRank];
			}
			else {
				return [...this.props.leaders, { isSeparator: true }, currentPlayerRank];
			}
		}
		else {
			return this.props.leaders;
		}		
	}

	keyExtractor(item) {
		return item.isSeparator ? 'separator': item.score.user.uid + item.rank;
	}

	renderOptionRow = (data, id, highlighted) => {
		return (<Button title={data.name}
			style={styles.filterButton}
			titleStyle={styles.filterButtonTitle}
			touchable={false}
			selected={highlighted} />);
	}

	renderLeader = ({ item }) => {
		if (item.isSeparator) {
			return <RankSeparator />;
		}
		else {
			const user = this.props.user;
			let isMe = false;
			if (user && user.uid === item.score.user.uid) {
				isMe = true;
			}
			return <RankRow key={item.rank} rank={item.rank} score={item.score} isMe={isMe} />;
		}
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
						defaultIndex={this.getLevelIndex(this.props.selectedLevel)}
						renderRow={this.renderOptionRow}
						onSelect={this.onLevelSelected}>
						<Button title={this.getLevelLabel(this.props.selectedLevel)} style={styles.filterButton} titleStyle={styles.filterButtonTitle}
							onPress={() => { this.levelDD.show() }} />
					</ModalDropdown>
				</View>
				<View style={styles.filter}>
					<GameText style={styles.headerText}>Period</GameText>
					<ModalDropdown ref={ref => this.periodDD = ref} style={{ flex: 1 }}
						dropdownStyle={{ height: 'auto' }}
						options={periods}
						defaultIndex={this.getPeriodIndex(this.props.selectedPeriod)}
						renderRow={this.renderOptionRow}
						onSelect={this.onPeriodSelected}>
						<Button title={this.getPeriodLabel(this.props.selectedPeriod)} style={styles.filterButton} titleStyle={styles.filterButtonTitle}
							onPress={() => { this.periodDD.show() }} />
					</ModalDropdown>
				</View>

			</View>
			<View style={[commonStyles.border, styles.leaderboard]}>
				<FlatList data={this.getRows()} keyExtractor={this.keyExtractor} renderItem={this.renderLeader} />
			</View>

		</View>);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(LeaderboardScreen);

LeaderboardScreen.propTypes = {
	user: PropTypes.shape({
		uid: PropTypes.string
	}),
	highscores: PropTypes.object,
	leaders: PropTypes.arrayOf(PropTypes.shape({
		user: PropTypes.object,
		rank: PropTypes.number
	})),
	playerRank: PropTypes.number,
	selectedPeriod: PropTypes.string,
	selectedLevel: PropTypes.string,
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
		flex: 1
	},
	filterButtonTitle: {
		fontSize: 10
	}
});
