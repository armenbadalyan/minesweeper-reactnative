import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { restoreAuthenication, signOut } from '../../modules/auth';
import { View, Image, StyleSheet} from 'react-native';
import Button from '../../components/Button';
import GameText from '../../components/GameText';
import { BG_MAIN_COLOR } from '../../constants';
import logo from '../../assets/logo.png';

const mapStateToProps = state => ({
    auth: state.auth
});

const mapDispatchToProps = dispatch => ({
    restoreAuthenication: () => {
        dispatch(restoreAuthenication());
    },
    signOut: () => {
        dispatch(signOut());
    }
});

export class MainScreen extends Component {

    componentDidMount() {
        console.log('restoreAuthenication');
        this.props.restoreAuthenication();
    }

    startEasyGame = () => {
        this.navigateToGameScreen({
            rows: 8,
            cols: 8,
            mines: 10
        });
    }

    startHardGame = () => {
        this.navigateToGameScreen({
            rows: 16,
            cols: 16,
            mines: 40
        })
    }

    navigateToGameScreen(options) {
        this.props.navigation.navigate('Game', {
            gameOptions: options
        });
    }

    render() {
        return (<View style={styles.screen}>
            <View style={[styles.row, styles['row-flex-1']]}>
                <Image style={styles.logo} source={logo} resizeMode="contain" fadeDuration={0} />
            </View>
            <View style={[styles.row, styles.greeting]}>
                {this.props.auth.user && <GameText numberOfLines={1} ellipsizeMode="tail">Hello, {this.props.auth.user.displayName}</GameText>}
            </View>            
            <View style={styles.row}>
                <Button title="EASY" onPress={this.startEasyGame} style={styles.button} />
                <Button title="HARD" onPress={this.startHardGame} style={styles.button} />
                <Button title="LEADERBOARD" style={styles.button} />
                {this.props.auth.user && <Button title="SIGN OUT" style={styles.button} onPress={this.props.signOut} />}
            </View>            
            <View style={[styles.row, styles['row-flex-1']]}>
            </View>
        </View>);
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainScreen);

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
    },
    greeting: {
        height: 40,
        paddingLeft: 20,
        paddingRight: 20,
        marginBottom: 20
    }
});