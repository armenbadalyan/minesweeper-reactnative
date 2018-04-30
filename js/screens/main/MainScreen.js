import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { View, Image, StyleSheet} from 'react-native';
import Button from '../../components/Button';
import { BG_MAIN_COLOR } from '../../constants';
import logo from '../../assets/logo.png';

export default class MainScreen extends Component {

    onPress = () => {
        this.props.navigation.navigate('Game');
    }

    render() {
        return (<View style={styles.screen}>
            <View style={[styles.row, styles['row-flex-1']]}>
                <Image style={styles.logo} source={logo} resizeMode="contain" />
            </View>
            <View style={styles.row}>
                <Button title="EASY" onPress={this.onPress} style={styles.button} />
                <Button title="HARD" style={styles.button} />
                <Button title="LEADERBOARD" style={styles.button} />
            </View>            
            <View style={[styles.row, styles['row-flex-1']]}>
            </View>
        </View>);
    }
}

MainScreen.propTypes = {
    navigation: PropTypes.object
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch',
        backgroundColor: BG_MAIN_COLOR
    },
    row: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    'row-flex-1': {
        flex: 1
    },
    button: {
        width: '70%',
        marginBottom: 20        
    },
    logo: {
        width: 100,
        height: '70%'
    }
});