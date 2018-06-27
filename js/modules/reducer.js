import { combineReducers } from 'redux';
import auth from './auth';
import game from './game';

export const rootReducer = {
    auth,
    game
}

export type reducers = typeof rootReducer;

export default combineReducers(rootReducer);
