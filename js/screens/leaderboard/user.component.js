import React, { PureComponent } from 'react';
import { View, Text, Image } from 'react-native';
import styles from './styles.js';

class User extends PureComponent {
	render() {

		const user = this.props.user,
			  index = this.props.index;

		return (<View style={styles.user}>
					<Text>{index}</Text>
					{/*<Image style={styles.avatar} source={{uri: user.picture.thumbnail}} />*/}
					<Text>{user.name.first + ' ' + user.name.last}</Text>
				</View>);
	}
}

export default User;