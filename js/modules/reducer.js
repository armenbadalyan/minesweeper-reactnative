import { combineReducers } from 'redux';
import game from './game';

export const rootReducer = {
    game
}

export type reducers = typeof rootReducer;

export default combineReducers(rootReducer);
