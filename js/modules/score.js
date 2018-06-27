import firebase from 'react-native-firebase';

// Actions
export const UPDATE_BEST_SCORE = 'score/UPDATE_BEST_SCORE';

// default state
const initialState = {
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
                dispatch({
                    type: UPDATE_BEST_SCORE,
                    payload: {
                        [difficulty]: {
                            score,
                            timestamp
                        }
                    }
                });
            })
            .catch(err => {
                console.log(err);
            })
        }
        
    }
}
