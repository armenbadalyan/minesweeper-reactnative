import React, { Component } from 'react';
import { View, Text, Image, FlatList,StyleSheet } from 'react-native';
import Button from '../../components/Button';
import GameText from '../../components/GameText';
import { BG_MAIN_COLOR} from '../../constants';
import commonStyles from '../../shared/styles'


export default class LeaderboardScreen extends Component {
	static navigationOptions = {};

	constructor(props) {
		super(props);

		this.state = {
			users: []
		};
	}

	componentDidMount() {
		
	}	

	render() {
		return (<View style={styles.screen}>
			<View style={[styles.header, commonStyles.border]}>
				<Button title="<" onPress={() => { this.props.navigation.goBack() }}/>
				<View style={styles.filter}>
					<GameText style={styles.headerText}>Level</GameText>
					<Button title="Intermediate" style={styles.filterButton} titleStyle={styles.filterButtonTitle}/>
				</View>
				<View style={styles.filter}>
					<GameText style={styles.headerText}>Period</GameText>
					<Button title="Overall" style={styles.filterButton} titleStyle={styles.filterButtonTitle}/>
				</View>
				
			</View>
			<View style={[commonStyles.border, styles.leaderboard]}>

				</View>
			
		</View>);
	}
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
