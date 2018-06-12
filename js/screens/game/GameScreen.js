import React, { Component } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { initGame, cellClick, cellAltClick, convertToMines} from '../../modules/game';
import StatBoard from '../../components/statboard/StatBoard';
import Minefield from '../../components/minefield/Minefield';

import styles from './styles.js';

const mapStateToProps = state => ({
    game: state.game
});

const mapDispatchToProps = dispatch => ({
    initGame: (rows, cols, mines) => {
        dispatch(initGame(rows, cols, mines));
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
        this.props.initGame(options.rows, options.cols, options.mines);
    }

    render() {
        return (
            <View style={styles.game}>
                <StatBoard 
                    game={this.props.game.game} 
                    flaggedMines={this.countFlaggedMines(this.props.game.field)} 
                    onGameButtonPressed={this.onGameButtonPressed}
                    onMenuButtonPressed={this.onMenuButtonPressed} />
                { /*<div className="game__separator" />*/ }
                <Minefield field={this.props.game.field} status={this.props.game.game.status} onCellClick={this.handleCellClick}  onCellAltClick={this.handleCellAltClick} mines="10" />
               { /*<Button title="Convert to mines" onPress={this.handleConvertToMines} /> */ }
            </View>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GameScreen);

