import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { initGame, cellClick, cellAltClick, convertToMines, GameStatus } from '../../modules/game';
import { updateProfile } from '../../modules/auth';
import { aknowledgeUserModal } from '../../modules/preferences';
import StatBoard from '../../components/statboard/StatBoard';
import Minefield from '../../components/minefield/Minefield';
import GameText from '../../components/GameText';
import UserIDModal from '../../components/UserIDModal';
import { formatGameTime } from '../../shared/time-utils';
import { connectivityAvailable } from '../../shared/connection';

const mapStateToProps = state => ({
    user: state.auth.user,
    preferences: state.preferences,
    game: state.game,
    status: state.game.game.status,
    lastScore: state.score.lastScore,
    bestScore: state.score.bestScore
});

const mapDispatchToProps = dispatch => ({
    initGame: (difficulty) => {
        dispatch(initGame(difficulty));
    },
    cellClick: (id) => {
        dispatch(cellClick(id))
    },
    cellAltClick: (id) => {
        dispatch(cellAltClick(id))
    },
    convertToMines: () => {
        dispatch(convertToMines());
    },
    updateProfile: (displayName) => {
        dispatch(updateProfile(displayName));
    },
    aknowledgeUserModal: () => {
        dispatch(aknowledgeUserModal());
    }
});

export class GameScreen extends Component {

    constructor(props) {
        super(props);

        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleCellAltClick = this.handleCellAltClick.bind(this);
        this.onGameButtonPressed = this.onGameButtonPressed.bind(this);
        this.onMenuButtonPressed = this.onMenuButtonPressed.bind(this);
    }

    componentDidMount() {
        this.startGameWithOptions(this.props.navigation.getParam('gameOptions'));
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.status !== GameStatus.WON
            && await connectivityAvailable()
            && this.isHighScore()
            && this.userAvailable()
            && !this.userModalAknowledged()) {
            this.modal.show();
        }
    }

    countFlaggedMines(field) {
        return Object.keys(field.cells)
            .reduce((count, key) => {
                const cell = field.cells[key];
                return cell.flagged ? ++count : count;
            }, 0);
    }

    onGameButtonPressed() {
        this.startGameWithOptions(this.props.navigation.getParam('gameOptions'));
    }

    onMenuButtonPressed() {
        this.props.navigation.goBack();
    }

    handleCellClick(id) {
        this.props.cellClick(id);
    }

    handleCellAltClick(id) {
        this.props.cellAltClick(id);
    }

    handleConvertToMines = () => {
        this.props.convertToMines();
    }

    startGameWithOptions(options) {
        this.props.initGame(options.difficulty);
    }

    gameScoreReady() {
        const { status, lastScore } = this.props;

        return status === GameStatus.WON && lastScore;
    }

    onSubmitUser = async (displayName) => {
        this.modal.hide();
        this.props.updateProfile(displayName);
        this.props.aknowledgeUserModal();
    }

    isHighScore() {
        const { status, lastScore } = this.props;

        return status === GameStatus.WON && lastScore && lastScore.isBestScore;
    }

    userAvailable() {
        return this.props.user;
    }

    userModalAknowledged() {
        return this.props.preferences.userModalAknowledged;
    }

    render() {
        return (
            <View style={styles.game}>
                <StatBoard
                    game={this.props.game.game}
                    flaggedMines={this.countFlaggedMines(this.props.game.field)}
                    onGameButtonPressed={this.onGameButtonPressed}
                    onMenuButtonPressed={this.onMenuButtonPressed} />
                { /*<div className="game__separator" />*/}
                <Minefield field={this.props.game.field} status={this.props.game.game.status} onCellClick={this.handleCellClick} onCellAltClick={this.handleCellAltClick} />
                { /*<Button title="Convert to mines" onPress={this.handleConvertToMines} /> */}
                {this.gameScoreReady() && <View style={styles.winSection}>
                    <GameText style={styles.winMessage}>Completed in {formatGameTime(this.props.lastScore.score, 2)}s</GameText>
                    {this.isHighScore() && <GameText style={styles.highscoreMessage}>New high score!</GameText>}
                </View>
                }

                <UserIDModal ref={ref => this.modal = ref}
                    defaultValue={this.props.user && this.props.user.displayName}
                    onSubmit={this.onSubmitUser} />

            </View>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GameScreen);

GameScreen.propTypes = {
    game: PropTypes.shape({
        game: PropTypes.object,
        field: PropTypes.object
    }),
    lastScore: PropTypes.shape({
        score: PropTypes.number
    }),
    status: PropTypes.string,
    user: PropTypes.shape({
        displayName: PropTypes.string
    }),
    preferences: PropTypes.shape({
        userModalAknowledged: PropTypes.bool
    }),
    navigation: PropTypes.shape({
        getParam: PropTypes.func,
        goBack: PropTypes.func
    }),
    cellClick: PropTypes.func,
    cellAltClick: PropTypes.func,
    convertToMines: PropTypes.func,
    initGame: PropTypes.func,
    updateProfile: PropTypes.func,
    aknowledgeUserModal: PropTypes.func
}

const styles = StyleSheet.create({
    game: {
        flex: 1,
        borderWidth: 12,
        borderColor: '#C0C0C0',
        borderStyle: 'solid',
        backgroundColor: '#C0C0C0'

    },
    winSection: {
        width: '100%',
        flex: 1,
        flexDirection: 'column',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
    winMessage: {
        color: 'green',
        textAlign: 'center'
    },
    highscoreMessage: {
        color: 'red',
        textAlign: 'center'
    }
});