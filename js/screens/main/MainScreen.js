import React, { Component } from 'react';
import { View, Button} from 'react-native';

export default class MainScreen extends Component {

    onPress = () => {
        this.props.navigation.navigate('Game');
    }

    render() {
        return (<View>
            <Button title="Start" onPress={this.onPress} />
        </View>);
    }
}