// Actions

import { SIGN_OUT } from './auth';

export const SET_USER_MODAL_AKNOWLEDGED = 'preferences/SET_USER_MODAL_AKNOWLEDGED';


// default state
const initialState = {
    userModalAknowledged: false
};


//reducer
export default (state = initialState, action) => {
    switch (action.type) {
        case SET_USER_MODAL_AKNOWLEDGED:
            return {
                ...state,
                userModalAknowledged: true
            }
        case SIGN_OUT: 
            return {
                ...initialState
            }
        default:
            return state;
    }
}

// action creators

export function aknowledgeUserModal() {
    return {
        type: SET_USER_MODAL_AKNOWLEDGED
    }
}