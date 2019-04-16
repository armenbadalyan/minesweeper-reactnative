import { Vibration } from 'react-native';
import { saveScore } from './score';

// Actions

export const INIT_GAME = 'game/INIT_GAME';
export const START_GAME = 'game/START_GAME';
export const UPDATE_GAME = 'game/UPDATE_GAME';
export const FINISH_GAME = 'game/FINISH_GAME';
export const SET_ZOOM = 'game/SET_ZOOM';
export const TOGGLE_FLAG_MODE = 'preferences/TOGGLE_FLAG_MODE';


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
        orientation: GameOrientation.PORTRAIT,
        flagMode: false
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
        case START_GAME:
            return {
                ...state,
                game: {
                    ...state.game,
                    status: GameStatus.IN_PROGRESS,
                    startedAt: payload                    
                }
            }
        case UPDATE_GAME:
            return {
                ...state,
                field: payload
            }
        case FINISH_GAME:
            return {
                ...state,
                game: {
                    ...state.game,
                    finishedAt: payload.finishedAt,
                    status: payload.status
                }
            }
        case SET_ZOOM:
            return {
                ...state,
                displaySettings: {
                    ...state.displaySettings,
                    zoomLevel: payload
                }
            }
        case TOGGLE_FLAG_MODE:
            return {
                ...state,
                displaySettings: {
                    ...state.displaySettings,
                    flagMode: !state.displaySettings.flagMode
                }
            }
        default:
            return state;

    }
}


// action creators and thunks

export function startGame() {
    return {
        type: START_GAME,
        payload: global.nativePerformanceNow()
    }
}

export function updateField(newField) {
    return {
        type: UPDATE_GAME,
        payload: newField
    }
}

export function finishGame(finalStatus) {
    return {
        type: FINISH_GAME,
        payload: {
            finishedAt: global.nativePerformanceNow(),
            status: finalStatus
        }
    }
}


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
                    orientation: settings.orientation,
                    flagMode: false
                },
                difficulty
            }
        }
    }    
}

export function cellAction(id, isAlternative) {
    return (dispatch, getState) => {
        const game = getState().game
        const { flagMode } = game.displaySettings;
        let action;

        if (checkLostOrWon(game.game)) return;

        if (isAlternative && flagMode) {
            action = cellClick
        }
        else if (!isAlternative && !flagMode) {
            action = cellClick
        }
        else {
            action = cellAltClick
        }
        dispatch(action(id));        

        if (isAlternative) {
            Vibration.vibrate(200);
        }
    }
}

export function setZoomLevel(level) {
    return {
        type: SET_ZOOM,
        payload: level
    }
}

export function toggleFlagMode() {
    return {
        type: TOGGLE_FLAG_MODE
    }
}

function cellClick(id) {
    return (dispatch, getState) => {
        const start = global.nativePerformanceNow(),
            { game, field, game: { totalMines } } = getState().game;    

        let newField = field;

        if (checkFirstTap(game)) {
            newField = assignMineCountsToCells(plantMines(newField, totalMines, id));
            dispatch(startGame());        
        }

        if (newField.cells[id].closed) {
            newField = openCell(id, newField);
        } else {
            newField = quickOpen(id, newField);
        }

        dispatch(finishGameIfNeeded(newField));      

        console.log('cell click', global.nativePerformanceNow() - start);
    }
}

function cellAltClick(id) {
    return (dispatch, getState) => {
        const state = getState(),
            { field } = state.game,  
            cell = field.cells[id],
            { flagMode } = state.preferences;      

        let newField;

        if (cell.closed) {
            newField = {
                ...field,
                cells: {
                    ...field.cells,
                    [cell.id]: setCellAttribute(cell, 'flagged', !cell.flagged)
                }
            };

            dispatch(updateField(newField));
        }
        else if (flagMode) {                
            newField = quickOpen(id, field);   
            dispatch(finishGameIfNeeded(newField));          
        }
    }
}

function finishGameIfNeeded(field) {
    return (dispatch) => {
        let newStatus = getNextStatus(field),
            newField = field;                        

        if (newStatus === GameStatus.LOST) {
            newField = findMistakesAndUncoverMines(newField);
            dispatch(finishGame(newStatus));
        }
        else if (newStatus === GameStatus.WON) {
            newField = flagRemainingMines(newField);
            dispatch(finishGame(newStatus));                
            dispatch(saveGameScore());
        }

        dispatch(updateField(newField));    
    }    
}

function saveGameScore() {
    return (dispatch, getState) => {
        const { game } = getState().game;
        dispatch(saveScore(game.finishedAt - game.startedAt, game.difficulty));
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

function getNextStatus(field) {
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