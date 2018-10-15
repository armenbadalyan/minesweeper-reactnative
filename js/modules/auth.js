import firebase from 'react-native-firebase';

// Actions
export const SIGN_IN = 'auth/SIGN_IN';
export const SIGN_OUT = 'auth/SIGN_OUT';
export const USER_PROFILE_UPDATE = 'auth/USER_PROFILE_UPDATE'

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
                unsubscribe();
                if (user) {
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
                    dispatch({
                        type: SIGN_IN,
                        payload: credential.user.toJSON()
                    });
                    return credential.user
                }
                else {
                    return Promise.reject();
                }
            })
            .then(user => {
                if (!user.displayName) {
                    return dispatch(updateProfile(`Player${generatePlayerId(4)}`));                    
                }
                return user.toJSON();
            });
    }
}

export function updateProfile(displayName) {
    return (dispatch, getState) => {
        let user = firebase.auth().currentUser;
        
        return user.updateProfile({
            displayName
        }).then(() => {
            user = firebase.auth().currentUser.toJSON();
    
            sendUpdateProfileCommand(user.uid);
            dispatch({
                type: USER_PROFILE_UPDATE,
                payload: user
            });
            return user;
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

function sendUpdateProfileCommand(uid) {
    return firebase.firestore()
        .collection('commands')
        .add({
            type: 'UPDATE_PROFILE',
            uid: uid
        })
        .catch(err => {
            console.log(err);
        });
}

function generatePlayerId(n) {
    let id = '';
    while (n) {
        id += Math.floor(Math.random() * 10);
        n--;
    }
    return id;
}
