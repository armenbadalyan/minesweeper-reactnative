import { combineReducers } from 'redux';
import auth from './auth';
import game from './game';
import score from './score';
import preferences from './preferences';

export const rootReducer = {
    auth,
    game,
    score,
    preferences
}

export type reducers = typeof rootReducer;

export default combineReducers(rootReducer);
