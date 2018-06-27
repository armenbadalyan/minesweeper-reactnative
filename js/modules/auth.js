import firebase from 'react-native-firebase';

// Actions
const SIGN_IN = 'auth/SIGN_IN';
const SIGN_OUT = 'auth/SIGN_OUT';
const USER_PROFILE_UPDATE = 'auth/USER_PROFILE_UPDATE'

// default state
const initialState = {
    user: null
};

//reducer
export default (state = initialState, action) => {
    const payload = action.payload;
    switch (action.type) {
        case SIGN_IN:
            return {
                ...state,
                user: payload
            }
        case USER_PROFILE_UPDATE:
            return {
                ...state,
                user: payload
            }
        case SIGN_OUT:
            return {
                ...state,
                user: null
            }
        default:
            return state;
    }
}

// action creators

export function restoreAuthenication() {
    return (dispatch) => {
        const unsubscribe = firebase.auth().onAuthStateChanged(function (user) {
            console.log(user);
            unsubscribe();
            if (user) {
                console.log('Current user ', user);
                dispatch({
                    type: SIGN_IN,
                    payload: user.toJSON()
                });
            }
            else {
                dispatch(signInAnonymously());
            }
        });

    }
}

export function signInAnonymously() {
    return (dispatch) => {
        firebase.auth()
            .signInAnonymouslyAndRetrieveData()
            .then(credential => {
                if (credential) {
                    console.log('default app user ->', credential.user.toJSON());
                    dispatch({
                        type: SIGN_IN,
                        payload: credential.user.toJSON()
                    });
                    return credential.user;
                }
                else {
                    Promise.reject();
                }
            })
            .then(user => {
                if (!user.displayName) {
                    user.updateProfile({
                        displayName: `Player${generatePlayerId(20)}`
                    }).then(() => {
                        dispatch({
                            type: USER_PROFILE_UPDATE,
                            payload: firebase.auth().currentUser.toJSON()
                        });
                    });
                }
                return user;
            })
            .catch(err => {
                console.log(err);
            });
    }
}

export function signOut() {
    return dispatch => {
        firebase.auth().signOut().then(() => {
            dispatch({
                type: SIGN_OUT
            });
        })
    }
}

function generatePlayerId(n) {
    let id = '';
    while(n) {
        id += Math.floor(Math.random()*10);
        n--;
    }
    return id;
}
