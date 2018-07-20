import firebase from 'react-native-firebase';

// Actions

import { SIGN_OUT } from './auth';

export const UPDATE_BEST_SCORE = 'score/UPDATE_BEST_SCORE';
export const SET_SCORE_SUBMITTED = 'score/SET_SCORE_SUBMITTED';
export const SET_LAST_SCORE = 'score/SET_LAST_SCORE';

// default state
const initialState = {
    lastScore: null,
    bestScore: {
        beginner: null,
        intermediate: null,
        expert: null
    }
};

const SUBMIT_SCORE = 'SUBMIT_SCORE';

//reducer
export default (state = initialState, action) => {
    const payload = action.payload;
    switch (action.type) {
        case UPDATE_BEST_SCORE:
            return {
                ...state,
                bestScore: {
                    ...state.bestScore,
                    ...payload
                }
            }
        case SET_SCORE_SUBMITTED:
            return {
                ...state,
                bestScore: {
                    ...state.bestScore,
                    [payload.difficulty]: {
                        ...state.bestScore[payload.difficulty],
                        submitted: true
                    }                    
                }
            }
        case SET_LAST_SCORE: {
            return {
                ...state,
                lastScore: payload
            }
        }
        case SIGN_OUT: {
            return {
                ...initialState
            }
        }
        default:
            return state;
    }
}

// action creators

export function saveScore(score, difficulty) {
    return (dispatch, getState) => {
        const user = getState().auth.user,
            bestScore = getState().score.bestScore,
            timestamp = Date.now();
        
        let isBestScore = false;
        
        if (bestScore[difficulty] === null || score < bestScore[difficulty].score) {
            isBestScore = true;

            // save high score to server
            if (user) {            
                firebase.firestore()
                    .collection('commands')
                    .add({
                        type: SUBMIT_SCORE,
                        uid: user.uid,
                        payload: {
                            score,
                            difficulty,
                            timestamp
                        }                    
                    })
                    .catch(err => {
                        console.log(err);
                    });            
            }

            // update high score in store
            dispatch({
                type: UPDATE_BEST_SCORE,
                payload: {
                    [difficulty]: {
                        score,
                        submitted: !!user,
                        timestamp
                    }
                }
            });
        }            

        dispatch({
            type: SET_LAST_SCORE,
            payload: {
                score,                    
                timestamp,
                isBestScore
            }
        });        
    }
}

export function restoreScore() {
    return (dispatch, getState) => {
        const user = getState().auth.user;
        console.log('restoreScore');
        if (user) {
            return firebase.firestore()
                .collection('scores')
                .where('user.uid', '==', user.uid)
                .onSnapshot((snapshot) => {
                    snapshot.forEach(doc => {
                        const {score, difficulty, timestamp} = doc.data();
                        dispatch({
                            type: UPDATE_BEST_SCORE,
                            payload: {
                                [difficulty]: {
                                    score,
                                    timestamp,
                                    submitted: true
                                }
                            }
                        });
                    });
                });
        }
        else {
            return Promise.reject();
        }
    }
}

export function submitOfflineScores() {
    return (dispatch, getState) => {
        const bestScore = getState().score.bestScore;
        
        const submissions = Object.keys(bestScore)
            .filter(difficulty => bestScore[difficulty] !== null && !bestScore[difficulty].submitted)
            .map(difficulty => {
                console.log(bestScore[difficulty]);
                return dispatch(submitScore(bestScore[difficulty], difficulty));
            });

        return Promise.all(submissions);
    }
}

function submitScore(scoreData, difficulty) {
    return (dispatch, getState) => {
        const user = getState().auth.user;
        if (user) {            
            return firebase.firestore()
                .collection('commands')
                .add({
                    type: SUBMIT_SCORE,
                    uid: user.uid,
                    payload: {
                        score: scoreData.score,
                        difficulty: difficulty,
                        timestamp: scoreData.timestamp
                    }                    
                })
                .then(() => {
                    dispatch({
                        type: SET_SCORE_SUBMITTED,
                        payload: {
                            difficulty: difficulty
                        }
                    });
                })           
        }
        else {
            return Promise.reject('User not authneticated');
        }
    }
    
}
