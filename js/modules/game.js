import { Vibration } from 'react-native';
import { saveScore } from './score';

// Actions

const INIT_GAME = 'game/INIT_GAME';
const UPDATE_GAME = 'game/UPDATE_GAME';
const SET_ZOOM = 'game/SET_ZOOM';


export const GameStatus = {
    NEW: 'new',
    IN_PROGRESS: 'inprogress',
    WON: 'won',
    LOST: 'lost'
}

export const DifficultyLevel = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    EXPERT: 'expert'
}

export const GameOrientation = {
    PORTRAIT: 'portrait',
    LANDSCAPE: 'landscape'
}

export const fieldSettings = {
    [DifficultyLevel.BEGINNER]: {
        rows: 8,
        cols: 8,
        mines: 10,
        orientation: GameOrientation.PORTRAIT
    },
    [DifficultyLevel.INTERMEDIATE]: {
        rows: 16,
        cols: 16,
        mines: 40,
        orientation: GameOrientation.PORTRAIT
    },
    [DifficultyLevel.EXPERT]: {
        rows: 16,
        cols: 30,
        mines: 99,
        orientation: GameOrientation.LANDSCAPE
    }}


// default state
const initialState = {
    game: {
        status: GameStatus.NEW,
        startedAt: 0,
        finishedAt:0,
        totalMines: 0,
        difficulty: null
    },
    field: {
        rows: 0,
        cols: 0,
        cells: {}
    },
    displaySettings: {
        zoomLevel: 1,
        orientation: GameOrientation.PORTRAIT
    }
};

const mines = (function () {
    let cells = {};
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            cells[i + ':' + j] = {
                id: i + ':' + j,
                row: i,
                col: j,
                closed: false,
                flagged: false,
                mine: true,
                exploded: false,
                mistake: false,
                minesAround: 0
            }
        }
    }
    return cells;
})();


//reducer
export default (state = initialState, action) => {
    const payload = action.payload;
    switch (action.type) {
        case INIT_GAME:
            return {
                ...state,
                game: {
                    ...state.game,
                    status: GameStatus.NEW,
                    startedAt: 0,
                    finishedAt: 0,
                    totalMines: payload.mines,
                    difficulty: payload.difficulty,
                },
                field: payload.field,
                displaySettings: {
                    ...state.displaySettings,
                    ...payload.displaySettings
                }
            }
        case UPDATE_GAME:
            return {
                ...state,
                game: {
                    ...state.game,
                    status: payload.status,
                    startedAt: payload.startedAt,
                    finishedAt: payload.finishedAt
                },
                field: payload.field
            }
        case SET_ZOOM:
            return {
                ...state,
                displaySettings: {
                    ...state.displaySettings,
                    zoomLevel: payload
                }
            }
        default:
            return state;

    }
}


// action creators

export function initGame(difficulty) {
    const start = global.nativePerformanceNow();
    const settings = fieldSettings[difficulty];
    const mines = settings.mines;
    //const field = assignMineCountsToCells(plantMines(rows, cols, mines));
    console.log('init game', global.nativePerformanceNow() - start);

    if (settings) {
        return {
            type: INIT_GAME,
            payload: {
                mines,
                field: getCleanField(settings.rows, settings.cols),
                displaySettings: {
                    orientation: settings.orientation
                },
                difficulty
            }
        }
    }    
}

export function cellClick(id) {
    return (dispatch, getState) => {
        const start = global.nativePerformanceNow(),
            { game, field, game: { totalMines } } = getState().game;       
            //cell = field.cells[id];

        let newField = field,
            startedAt = game.startedAt,
            finishedAt = game.finishedAt,
            newStatus;
            
        if (checkLostOrWon(game)) return;

        if (checkFirstTap(game)) {
            newField = assignMineCountsToCells(plantMines(newField, totalMines, id));
            startedAt = global.nativePerformanceNow();            
        }
        
        newStatus = GameStatus.IN_PROGRESS;

        if (newField.cells[id].closed) {
            newField = openCell(id, newField);
        } else {
            newField = quickOpen(id, newField);
        }

        newStatus = validateGameStatus(newField);

        if (newStatus === GameStatus.LOST) {
            newField = findMistakesAndUncoverMines(newField);
        }
        else if (newStatus === GameStatus.WON) {
            finishedAt = global.nativePerformanceNow();
            newField = flagRemainingMines(newField);
        }
        console.log('cell click', global.nativePerformanceNow() - start);

        dispatch({
            type: UPDATE_GAME,
            payload: {
                startedAt,
                finishedAt,
                status: newStatus,
                field: newField
            }
        });

        if (newStatus === GameStatus.WON) {
            dispatch(saveScore(finishedAt - startedAt, game.difficulty));
        }
    }
}

export function cellAltClick(id) {
    return (dispatch, getState) => {
        const { game, field } = getState().game,  
            cell = field.cells[id];

        let newField;
        
        if (checkLostOrWon(game)) return;

        if (cell.closed) {
            newField = {
                ...field,
                cells: {
                    ...field.cells,
                    [cell.id]: setCellAttribute(cell, 'flagged', !cell.flagged)
                }
            };

            Vibration.vibrate(200);

            dispatch({
                type: UPDATE_GAME,
                payload: {
                    startedAt: game.startedAt,
                    finishedAt: game.finishedAt,
                    status: game.status,
                    field: newField
                }
            });
        }        
    }
}

export function convertToMines() {
    return {
        type: UPDATE_GAME,
        payload: {
            field: {
                rows: 16,
                cols: 16,
                cells: mines
            }
        }
    };
}

export function setZoomLevel(level) {
    return {
        type: SET_ZOOM,
        payload: level
    }
}

function getCleanField(rows, cols) {
   return {
        rows,
        cols,
        cells: createCells(rows, cols)
    }
}

function plantMines(field, mineCount, firstCellId) {
    const mineCells = {},
        cellKeys = Object.keys(field.cells),
        firstCellIndex = cellKeys.findIndex(cellKey => cellKey === firstCellId);

    cellKeys.splice(firstCellIndex, 1);
    
    while (mineCount) {
        mineCount--;

        let index = Math.floor(Math.random() * cellKeys.length),
            id = cellKeys[index];

        cellKeys.splice(index, 1);

        mineCells[id] = setCellAttribute(field.cells[id], 'mine', true);
    }

    return {
        ...field,
        cells: {
            ...field.cells,
            ...mineCells
        }
    }
}

function createCells(rows, cols) {

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

function assignMineCountsToCells(field) {
    Object.keys(field.cells)
        .forEach(id => {
            var cell = field.cells[id];

            if (!cell.mine) {
                let mineCount = countMinesAroundCell(cell, field);
                field.cells[id] = setCellAttribute(cell, 'minesAround', mineCount);
            }
        });

    return {
        ...field
    }
}

function countMinesAroundCell(cell, field) {
    return getNeighbourCells(cell, field).reduce((prev, cell) => {
        return cell.mine ? ++prev : prev;
    }, 0);
}

function getNeighbourCells(cell, field) {
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

function openCell(cellId, field) {
    let newField = field,
        cell = newField.cells[cellId];

    if (cell.mine) {
        field.cells[cell.id] = {
            ...cell,
            exploded: true,
            closed: false
        }

    } else {

        let cellStack = [cell];

        field.cells[cell.id] = {
            ...cell,
            closed: false,
            flagged: false
        }

        while (cellStack.length) {
            cell = cellStack.shift();

            if (cell.minesAround === 0) {
                let changedCells = getNeighbourCells(cell, newField)
                    .filter(cell => cell.closed && !cell.flagged)
                    .map(cell => {
                        const newCell = setCellAttribute(cell, 'closed', false);
                        cellStack.push(cell);
                        return newCell;
                    });
                // replace old field cells with the modified ones
                changedCells.forEach(cell => {
                    field.cells[cell.id] = cell;
                });
            }
        }
    }

    return {
        ...field,
        cells: newField.cells
    };
}

function quickOpen(cellId, field) {
    const cell = field.cells[cellId];
    if (cell.minesAround > 0) {
        let cellNeighbours = getNeighbourCells(cell, field),
            flaggedNeighbours = cellNeighbours.filter(cell => cell.flagged);

        if (flaggedNeighbours.length === cell.minesAround) {
            return cellNeighbours
                .filter(cell => !cell.flagged && cell.closed)
                .reduce((prevField, cell) => openCell(cell.id, prevField), field);
        } else {
            return field;
        }
    } else {
        return field;
    }
}

function validateGameStatus(field) {
    const cellKeys = Object.keys(field.cells);
    const hasExploded = cellKeys.some(key => {
        return field.cells[key].exploded
    });

    if (hasExploded) {
        return GameStatus.LOST
    } else {
        const allMinesFound = cellKeys
            .filter(key => {
                return !field.cells[key].mine;
            })
            .every(key => {
                return !field.cells[key].closed;
            });

        if (allMinesFound) {
            return GameStatus.WON
        } else {
            return GameStatus.IN_PROGRESS;
        }
    }
}

function findMistakesAndUncoverMines(field) {
    return findMistakes(uncoverMines(field))
}

function uncoverMines(field) {
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
                    [key]: setCellAttribute(prevField.cells[key], 'closed', false)
                }
            }
        }, field)
}

function flagRemainingMines(field) {
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
                    [key]: setCellAttribute(prevField.cells[key], 'flagged', true)
                }
            }
        }, field)
}

function findMistakes(field) {
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
                    [key]: setCellAttribute(setCellAttribute(prevField.cells[key], 'mistake', true), 'closed', false)
                }
            }
        }, field)
}

function setCellAttribute(cell, attr, value) {
    return {
        ...cell,
        [attr]: value
    }
}

function checkLostOrWon(game) {
    return game.status === GameStatus.WON || game.status === GameStatus.LOST;
}

function checkFirstTap(game) {
    return game.status === GameStatus.NEW;
}