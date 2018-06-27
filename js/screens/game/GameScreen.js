import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { initGame, cellClick, cellAltClick, convertToMines, GameStatus } from '../../modules/game';
import StatBoard from '../../components/statboard/StatBoard';
import Minefield from '../../components/minefield/Minefield';
import GameText from '../../components/GameText';

const mapStateToProps = state => ({
    game: state.game,
    status: state.game.game.status,
    startedAt: state.game.game.startedAt,
    finishedAt: state.game.game.finishedAt
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

    getCompletionTime(startedAt, finishedAt) {
        console.log(startedAt, finishedAt);
        return ((finishedAt - startedAt) / 1000).toFixed(2);
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
                <Minefield field={this.props.game.field} status={this.props.game.game.status} onCellClick={this.handleCellClick} onCellAltClick={this.handleCellAltClick} mines="10" />
                { /*<Button title="Convert to mines" onPress={this.handleConvertToMines} /> */}
                {this.props.status === GameStatus.WON && <View style={styles.winSection}>
                    <GameText style={styles.winMessage}>Completed in {this.getCompletionTime(this.props.startedAt, this.props.finishedAt)}s</GameText>
                    <GameText style={styles.highscoreMessage}>New highscore!</GameText>
                </View>
                }
            </View>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GameScreen);

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