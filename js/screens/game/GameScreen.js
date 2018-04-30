import React, { Component } from 'react';
import { Text, View } from 'react-native';
import Minefield from '../../components/minefield/minefield';
import StatBoard from '../../components/statboard/statboard';
import styles from './styles.js';
import commonStyles from '../../shared/styles.js';
//import './game.css';


const COLS = 16;
const ROWS = 16;
const MINES = 40;

const NEW = 'new';
const IN_PROGRESS = 'inprogress';
const WON = 'won';
const LOST = 'lost';

export default class GameScreen extends Component {

    static navigatorStyle = {
        navBarBackgroundColor: '#C0C0C0'
    };

    static navigatorButtons = {
        leftButtons: [{
            icon: require('../../assets/navicon_menu.png'),
            id: 'menu'
        }]
    };

    constructor(props) {
        super(props);
        this.state = this.getInitialGameState();
        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleCellAltClick = this.handleCellAltClick.bind(this);
        this.handleGameButtonClick = this.handleGameButtonClick.bind(this);
    }

    getInitialGameState() {

        let state = {
            game: {
                status: NEW,
                startedAt: null,
                totalMines: MINES
            },
            field: {
                rows: ROWS,
                cols: COLS,
                cells: this.createCells(ROWS, COLS)
            }
        }

        state.field = this.countMines(this.plantMines(state.field, MINES));

        return state;
    }

    createCells(rows, cols) {

        let cellCount = rows * cols,
            cells = {};

        while (cellCount) {

            cellCount--;

            let row = Math.floor(cellCount / cols),
                col = cellCount % cols;

            cells[row + ':' + col] = {
                id: row + ':' + col,
                row: row,
                col: col,
                closed: true,
                flagged: false,
                mine: false,
                exploded: false,
                mistake: false,
                minesAround: 0
            }
        }

        return cells;
    }

    startGameIfNeeded(cell, state) {

        if (state.game.status === NEW) {
            return Object.assign({}, state, {
                game: {
                    status: IN_PROGRESS,
                    startedAt: new Date(),
                    totalMines: MINES
                },
                field: state.field
            });
        } else {
            return state;
        }
    }

    resetGame() {
        this.setState(this.getInitialGameState());
    }

    plantMines(field, mineCount) {
        let mineCells = {},
            cellKeys = Object.keys(field.cells);

        while (mineCount) {
            mineCount--;

            let index = Math.floor(Math.random() * cellKeys.length),
                id = cellKeys[index];

            cellKeys.splice(index, 1);

            mineCells[id] = this.setCellAttribute(field.cells[id], 'mine', true);
        }


        const cells = Object.assign({}, field.cells, mineCells)

        return Object.assign({}, field, {
            cells: cells
        });
    }

    countMines(field) {
        Object.keys(field.cells)
            .forEach(id => {
                var cell = field.cells[id];

                if (!cell.mine) {
                    let mineCount = this.countMinesAroundCell(cell, field);
                    field.cells[id] = this.setCellAttribute(cell, 'minesAround', mineCount);
                }
            });
        return Object.assign({}, field);
    }

    countMinesAroundCell(cell, field) {
        return this.getNeighbourCells(cell, field).reduce((prev, cell) => {
            return cell.mine ? ++prev : prev;
        }, 0);
    }

    getNeighbourCells(cell, field) {
        let row = cell.row,
            col = cell.col,
            neighboursIndices = [
                {
                    row: row - 1,
                    col: col - 1
                }, {
                    row: row - 1,
                    col: col
                }, {
                    row: row - 1,
                    col: col + 1
                },
                {
                    row: row,
                    col: col - 1
                }, {
                    row: row,
                    col: col + 1
                },
                {
                    row: row + 1,
                    col: col - 1
                }, {
                    row: row + 1,
                    col: col
                }, {
                    row: row + 1,
                    col: col + 1
                }];


        return neighboursIndices.filter(coords => {
            return coords.row >= 0 && coords.row < field.rows && coords.col >= 0 && coords.col < field.cols
        }).map(coords => field.cells[coords.row + ':' + coords.col]);
    }

    openCell(cell, field) {
        let newField = field;

        if (cell.mine) {
            cell.exploded = true;
            cell.closed = false;
        } else {

            let cellStack = [cell];

            cell.closed = false;

            while (cellStack.length) {
                cell = cellStack.shift();

                if (cell.minesAround === 0) {
                    this.getNeighbourCells(cell, newField)
                        .filter(cell => cell.closed && !cell.flagged)
                        .forEach(cell => {
                            cell.closed = false;
                            cellStack.push(cell);
                        });
                }
            }
        }

        return {
            ...field,
            cells: newField.cells
        };
    }

    quickOpen(cell, field) {
        if (cell.minesAround > 0) {
            let cellNeighbours = this.getNeighbourCells(cell, field),
                flaggedNeighbours = cellNeighbours.filter(cell => cell.flagged);

            if (flaggedNeighbours.length === cell.minesAround) {
                return cellNeighbours
                    .filter(cell => !cell.flagged && cell.closed)
                    .reduce((prevField, cell) => this.openCell(cell, prevField), field);
            } else {
                return field;
            }
        } else {
            return field;
        }
    }

    validateGameStatus(state) {
        const cellKeys = Object.keys(state.field.cells);
        const hasExploded = cellKeys.some(key => {
            return state.field.cells[key].exploded
        });

        if (hasExploded) {
            return Object.assign({}, state, {
                game: {
                    ...state.game,
                    status: LOST
                },
                field: this.findMistakes(this.uncoverMines(state.field))
            });
        } else {
            const allMinesFound = cellKeys
                .filter(key => {
                    return !state.field.cells[key].mine;
                })
                .every(key => {
                    return !state.field.cells[key].closed;
                });

            if (allMinesFound) {
                return Object.assign({}, state, {
                    game: {
                        ...state.game,
                        status: WON
                    },
                    field: this.flagRemainingMines(state.field)
                });
            } else {
                return state;
            }
        }
    }

    uncoverMines(field) {
        const cellKeys = Object.keys(field.cells);
        return cellKeys
            .filter(key => {
                const cell = field.cells[key];
                return cell.mine && !cell.exploded;
            })
            .reduce((prevField, key) => {
                return {
                    ...prevField,
                    cells: {
                        ...prevField.cells,
                        [key]: this.setCellAttribute(prevField.cells[key], 'closed', false)
                    }
                }
            }, field)
    }

    flagRemainingMines(field) {
        const cellKeys = Object.keys(field.cells);
        return cellKeys
            .filter(key => {
                const cell = field.cells[key];
                return cell.mine && !cell.flagged;
            })
            .reduce((prevField, key) => {
                return {
                    ...prevField,
                    cells: {
                        ...prevField.cells,
                        [key]: this.setCellAttribute(prevField.cells[key], 'flagged', true)
                    }
                }
            }, field)
    }

    findMistakes(field) {
        const cellKeys = Object.keys(field.cells);
        return cellKeys
            .filter(key => {
                const cell = field.cells[key];
                return cell.flagged && !cell.mine;
            })
            .reduce((prevField, key) => {
                return {
                    ...prevField,
                    cells: {
                        ...prevField.cells,
                        [key]: this.setCellAttribute(this.setCellAttribute(prevField.cells[key], 'mistake', true), 'closed', false)
                    }
                }
            }, field)
    }

    countFlaggedMines(field) {
        return Object.keys(field.cells)
            .reduce((count, key) => {
                const cell = field.cells[key];
                return cell.flagged ? ++count : count;
            }, 0)

    }


    setCellAttribute(cell, attr, value) {
        return Object.assign({}, cell, {
            [attr]: value
        })
    }

    handleGameButtonClick() {
        this.resetGame();
    }

    handleCellClick(id) {

        let state = this.startGameIfNeeded(this.state.field.cells[id], this.state),
            cell = state.field.cells[id],
            field = state.field;

        if (cell.closed) {
            field = this.openCell(cell, field);
        } else {
            field = this.quickOpen(cell, field);
        }

        state.field = field;

        state = this.validateGameStatus(state);

        this.setState({
            game: state.game,
            field: state.field
        });
    }

    handleCellAltClick(id) {
        let state = this.startGameIfNeeded(this.state.field.cells[id], this.state),
            cell = state.field.cells[id],
            field = state.field;


        if (cell.closed) {
            field = {
                ...field,
                cells: {
                    ...field.cells,
                    [cell.id]: this.setCellAttribute(cell, 'flagged', !cell.flagged)
                }
            };
        }

        state.field = field;

        state = this.validateGameStatus(state);

        this.setState({
            game: state.game,
            field: state.field
        });
    }

    render() {
        return (
            <View style={styles.game}>
                <StatBoard game={this.state.game} flaggedMines={this.countFlaggedMines(this.state.field)} onGameButtonClick={this.handleGameButtonClick} />
                { /*<div className="game__separator" />*/ }
                <Minefield field={this.state.field} onCellClick={this.handleCellClick}  onCellAltClick={this.handleCellAltClick} mines="10" />
            </View>
        );
    }
}
