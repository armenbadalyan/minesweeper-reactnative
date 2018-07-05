import firebase from 'react-native-firebase';

// Actions
export const UPDATE_BEST_SCORE = 'score/UPDATE_BEST_SCORE';
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
        case SET_LAST_SCORE: {
            return {
                ...state,
                lastScore: payload
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

            if (bestScore[difficulty] === null || score < bestScore[difficulty].score) {
                isBestScore = true;
                dispatch({
                    type: UPDATE_BEST_SCORE,
                    payload: {
                        [difficulty]: {
                            score,
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
                                    timestamp
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
