import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, Image, StyleSheet} from 'react-native';
import { restoreAuthenication, signOut } from '../../modules/auth';
import { DifficultyLevel } from '../../modules/game';
import Button from '../../components/Button';
import GameText from '../../components/GameText';
import { BG_MAIN_COLOR } from '../../constants';
import logo from '../../assets/logo.png';
import { formatGameTime } from '../../shared/time-utils';

const mapStateToProps = state => ({
    auth: state.auth,
    bestScore: state.score.bestScore
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

    startBeginnerGame = () => {
        this.navigateToGameScreen({
            difficulty: DifficultyLevel.BEGINNER
        });
    }

    startIntermediateGame = () => {
        this.navigateToGameScreen({
            difficulty: DifficultyLevel.INTERMEDIATE
        })
    }

    navigateToGameScreen(options) {
        this.props.navigation.navigate('Game', {
            gameOptions: options
        });
    }

    render() {
        const bestScore = this.props.bestScore;
        const beginnerScore = bestScore.beginner ? formatGameTime(bestScore.beginner.score, 2) : 'NA';
        const intermediateScore = bestScore.intermediate ? formatGameTime(bestScore.intermediate.score, 2) : 'NA';
        const expertScore = bestScore.expert ? formatGameTime(bestScore.expert.score, 2) : 'NA';

        return (<View style={styles.screen}>
            <View style={[styles.row, styles['row-flex-1']]}>
                <Image style={styles.logo} source={logo} resizeMode="contain" fadeDuration={0} />
            </View>
            <View style={[styles.row, styles.greeting]}>
                {this.props.auth.user && <GameText numberOfLines={1} ellipsizeMode="tail" style={styles.greetingText}>Hello, {this.props.auth.user.displayName}</GameText>}
            </View>            
            <View style={styles.row}>
                <Button title="BEGINNER" onPress={this.startBeginnerGame} style={styles.button} />
                <Button title="INTERMEDIATE" onPress={this.startIntermediateGame} style={styles.button} />
                <Button title="LEADERBOARD" style={styles.button} />
                {this.props.auth.user && <Button title="SIGN OUT" style={styles.button} onPress={this.props.signOut} />}
            </View>            
            <View style={[styles.row, styles['row-flex-1']]}>
                {this.props.auth.user && <GameText style={{marginBottom: 20}}>HIGH SCORES</GameText>}
                {this.props.auth.user && <View style={{width: '70%'}}>
                    <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
                        <View style={{flex: 1, alignItems: 'center'}}>
                            <GameText>Bgnr</GameText>
                            <GameText>{ beginnerScore }</GameText>
                        </View>
                        <View style={{flex: 1, alignItems: 'center'}}>
                            <GameText>Intrm</GameText>
                            <GameText>{ intermediateScore }</GameText>
                        </View>
                        <View style={{flex: 1, alignItems: 'center'}}>
                            <GameText>Xprt</GameText>
                            <GameText>{ expertScore }</GameText>
                        </View>                      
                    </View>                                  
                </View>}
                
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
        marginBottom: 20        
    },
    greetingText: {
        width: '70%',
        color: 'green'
    }
});