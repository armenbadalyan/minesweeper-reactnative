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

export function restoreAuthentication() {
    return (dispatch) => {
        return new Promise((resolve, reject) => {
            const unsubscribe = firebase.auth().onAuthStateChanged(function (user) {
                console.log(user);
                unsubscribe();
                if (user) {
                    console.log('Current user ', user);
                    dispatch({
                        type: SIGN_IN,
                        payload: user.toJSON()
                    });

                    resolve(user.toJSON());
                }
                else {
                    resolve(dispatch(signInAnonymously()));
                }
            });
        });
    }
}

export function signInAnonymously() {
    return (dispatch) => {
        return firebase.auth()
            .signInAnonymouslyAndRetrieveData()
            .then(credential => {
                if (credential) {
                    console.log('default app user ->', credential.user.toJSON());
                    dispatch({
                        type: SIGN_IN,
                        payload: credential.user.toJSON()
                    });
                    return credential.user.toJSON();
                }
                else {
                    return Promise.reject();
                }
            })
            .then(user => {
                if (!user.displayName) {
                    return user.updateProfile({
                        displayName: `Player${generatePlayerId(4)}`
                    }).then(() => {
                        const user = firebase.auth().currentUser.toJSON();
                        dispatch({
                            type: USER_PROFILE_UPDATE,
                            payload: user
                        });
                        return user;
                    });
                }
                return user.toJSON();
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
