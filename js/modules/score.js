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
            timestamp = Date.now();
        console.log(user);
        if (user) {
            console.log('save score');
            firebase.firestore()
            .collection('scores')
            .add({
                user: {
                    uid: user.uid,
                    displayName: user.displayName,
                    photo: user.photoURL
                },
                score,
                difficulty,
                timestamp
            })
            .then(() => {
                console.log('score saved');                
            })
            .catch(err => {
                console.log(err);
            });

            dispatch({
                type: UPDATE_BEST_SCORE,
                payload: {
                    [difficulty]: {
                        score,
                        timestamp
                    }
                }
            });

            dispatch({
                type: SET_LAST_SCORE,
                payload: {
                    score,
                    timestamp
                }
            });
        }
        
    }
}
