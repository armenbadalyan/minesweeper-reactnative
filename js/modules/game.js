
// Actions

const INIT_GAME = 'game/INIT_GAME';
const UPDATE_GAME = 'game/UPDATE_GAME';

const NEW = 'new';
const IN_PROGRESS = 'inprogress';
const WON = 'won';
const LOST = 'lost';

// default state
const initialState = {
    game: {
        status: NEW,
        startedAt: null,
        totalMines: 0
    },
    field: {
        rows: 0,
        cols: 0,
        cells: {}
    }
};

const mines = (function () {
    let cells = {};
    for(let i=0; i<16; i++) {
        for(let j=0; j<16; j++) {
            cells[i+':'+j] = {
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
                    status: NEW,
                    startedAt: null,
                    totalMines: payload.mines
                },
                field: payload.field
            }
        case UPDATE_GAME:
            return {
                ...state,
                game: {
                    ...state.game,
                    status: payload.status,
                    startedAt: payload.startedAt
                },
                field: payload.field
            }
        default:
            return state;

    }
}


// action creators

export function initGame(rows, cols, mines) {
    const start = Date.now();
    const field = countMines(plantMines(rows, cols, mines));
    console.log('init game', Date.now() - start);
    return {
        type: INIT_GAME,
        payload: {
            mines,
            field
        }
    }
}

export function cellClick(id) {
    return (dispatch, getState) => {
        const start = Date.now();
        const game = getState().game.game,
            field = getState().game.field,
            startedAt = game.status === NEW ? new Date() : game.startedAt,
            cell = field.cells[id];

        let newField,
            newStatus = IN_PROGRESS;

        if (cell.closed) {
            newField = openCell(cell, field);
        } else {
            newField = quickOpen(cell, field);
        }

        newStatus = validateGameStatus(newField);

        if (newStatus === LOST) {
            newField = findMistakesAndUncoverMines(newField);
        }
        else if (newStatus === WON) {
            newField = flagRemainingMines(newField);
        }

        console.log('cell click', Date.now() - start);

        dispatch({
            type: UPDATE_GAME,
            payload: {
                startedAt,
                status: newStatus,
                field: newField
            }
        });
    }
}

export function cellAltClick(id) {
    return (dispatch, getState) => {
        const game = getState().game.game,
            field = getState().game.field,
            startedAt = game.status === NEW ? new Date() : game.startedAt,
            cell = field.cells[id];

        let newField = field,
            newStatus = IN_PROGRESS;

        if (cell.closed) {
            newField = {
                ...field,
                cells: {
                    ...field.cells,
                    [cell.id]: setCellAttribute(cell, 'flagged', !cell.flagged)
                }
            };
        }

        dispatch({
            type: UPDATE_GAME,
            payload: {
                startedAt,
                status: newStatus,
                field: newField
            }
        });
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

function plantMines(rows, cols, mineCount) {
    const mineCells = {},
        field = {
            rows,
            cols,
            cells: createCells(rows, cols)
        },
        cellKeys = Object.keys(field.cells);

    while (mineCount) {
        mineCount--;

        let index = Math.floor(Math.random() * cellKeys.length),
            id = cellKeys[index];

        cellKeys.splice(index, 1);

        mineCells[id] = setCellAttribute(field.cells[id], 'mine', true);
    }


    const cells = Object.assign({}, field.cells, mineCells)

    return Object.assign({}, field, {
        cells: cells
    });
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

function countMines(field) {
    Object.keys(field.cells)
        .forEach(id => {
            var cell = field.cells[id];

            if (!cell.mine) {
                let mineCount = countMinesAroundCell(cell, field);
                field.cells[id] = setCellAttribute(cell, 'minesAround', mineCount);
            }
        });
    return Object.assign({}, field);
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

function openCell(cell, field) {
    let newField = field;

    if (cell.mine) {
        cell.exploded = true;
        cell.closed = false;
        field.cells[cell.id] = {
            ...cell,
            exploded: true,
            closed: false
        }

    } else {

        let cellStack = [cell];

        field.cells[cell.id] = {
            ...cell,
            closed: false
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

function quickOpen(cell, field) {
    if (cell.minesAround > 0) {
        let cellNeighbours = getNeighbourCells(cell, field),
            flaggedNeighbours = cellNeighbours.filter(cell => cell.flagged);

        if (flaggedNeighbours.length === cell.minesAround) {
            return cellNeighbours
                .filter(cell => !cell.flagged && cell.closed)
                .reduce((prevField, cell) => openCell(cell, prevField), field);
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
        return LOST
    } else {
        const allMinesFound = cellKeys
            .filter(key => {
                return !field.cells[key].mine;
            })
            .every(key => {
                return !field.cells[key].closed;
            });

        if (allMinesFound) {
            return WON
        } else {
            return IN_PROGRESS;
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
    return Object.assign({}, cell, {
        [attr]: value
    })
}