import { combineReducers } from 'redux';
import auth from './auth';
import game from './game';
import score from './score';
import leaderboard from './leaderboard';
import preferences from './preferences';

export const rootReducer = {
    auth,
    game,
    score,
    leaderboard,
    preferences
}

export type reducers = typeof rootReducer;

export default combineReducers(rootReducer);
