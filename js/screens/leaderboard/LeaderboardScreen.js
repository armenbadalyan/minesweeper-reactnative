import React, { Component } from 'react';
import { View, Text, Image, FlatList } from 'react-native';
import User from './user.component.js';
import styles from './styles.js';

export default class LeaderboardScreen extends Component {
	static navigationOptions = {};

	constructor(props) {
		super(props);

		this.state = {
			users: []
		};
	}

	componentDidMount() {
		fetch('https://randomuser.me/api/?results=5000')
			.then(response => response.json())
			.then(data => {
				this.setState({
					users: data.results
				});
			})
			.catch(error => {
				console.error(error);
			})
	}

	itemRenderer({ item, index }) {
		return <User user={item} index={index} />
	}


	getKey(item, index) {
		return index;
	}

	render() {
		return (<View style={styles.leaderboard}>
			<FlatList
				data={this.state.users}
				keyExtractor={this.getKey}
				renderItem={this.itemRenderer}
			/>
		</View>);
	}
}
