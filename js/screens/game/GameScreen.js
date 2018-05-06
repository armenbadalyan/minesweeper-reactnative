import React, { Component } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { initGame, cellClick, cellAltClick} from '../../modules/game';
import Minefield from '../../components/minefield/minefield';
import StatBoard from '../../components/statboard/statboard';
import styles from './styles.js';
import commonStyles from '../../shared/styles.js';
//import './game.css';


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
    }
});

const ROWS = 16;
const COLS = 16;
const MINES = 40;

export class GameScreen extends Component {

    constructor(props) {
        super(props);
      
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleCellAltClick = this.handleCellAltClick.bind(this);
        this.handleGameButtonClick = this.handleGameButtonClick.bind(this);
    }

    componentDidMount() {
        this.props.initGame(ROWS, COLS, MINES);
    }

    countFlaggedMines(field) {
        return Object.keys(field.cells)
            .reduce((count, key) => {
                const cell = field.cells[key];
                return cell.flagged ? ++count : count;
            }, 0)

    }

    handleGameButtonClick() {
        this.props.initGame(ROWS, COLS, MINES);
    }

    handleCellClick(id) {
        this.props.cellClick(id);
    }

    handleCellAltClick(id) {
        this.props.cellAltClick(id);
    }

    render() {
        return (
            <View style={styles.game}>
                <StatBoard game={this.props.game.game} flaggedMines={this.countFlaggedMines(this.props.game.field)} onGameButtonClick={this.handleGameButtonClick} />
                { /*<div className="game__separator" />*/ }
                <Minefield field={this.props.game.field} onCellClick={this.handleCellClick}  onCellAltClick={this.handleCellAltClick} mines="10" />
            </View>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GameScreen);

