import { combineReducers } from 'redux';
import auth from './auth';
import game from './game';
import score from './score';

export const rootReducer = {
    auth,
    game,
    score
}

export type reducers = typeof rootReducer;

export default combineReducers(rootReducer);
