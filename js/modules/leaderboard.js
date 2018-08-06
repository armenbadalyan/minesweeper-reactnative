import firebase from 'react-native-firebase';
import moment from 'moment';
import { DifficultyLevel } from './game';

// Actions

export const UPDATE_LEVEL = 'leaderboard/UPDATE_LEVEL';
export const UPDATE_PERIOD = 'leaderboard/UPDATE_PERIOD';
export const UPDATE_LEADERS = 'leaderboard/UPDATE_LEADERS';

export const RankingPeriod = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    OVERALL: 'overall'
}

const periodStart = {
    [RankingPeriod.DAILY]: () => {
        return moment().utc().startOf('day').valueOf()
    },
    [RankingPeriod.WEEKLY]: () => {
        return moment().utc().startOf('week').valueOf()
    },
    [RankingPeriod.OVERALL]: () => {
        return 0
    }
}

// default state
const initialState = {
    selectedLevel: DifficultyLevel.BEGINNER,
    selectedPeriod: RankingPeriod.OVERALL,
    leaders: [],
    playerRank: null
};

//reducer
export default (state = initialState, action) => {
    const payload = action.payload;
    switch (action.type) {
        case UPDATE_LEVEL:
            return {
                ...state,
                selectedLevel: payload
            }
        case UPDATE_PERIOD:
            return {
                ...state,
                selectedPeriod: payload
            }
        case UPDATE_LEADERS: 
            return {
                ...state,
                leaders: payload
            }
        default:
            return state;
    }
}

// action creators

export function updateLevel(level) {
    return (dispatch) => {
        dispatch({
            type: UPDATE_LEVEL,
            payload: level
        });
    }
}

export function updatePeriod(period) {
    return (dispatch) => {
        dispatch({
            type: UPDATE_PERIOD,
            payload: period
        });
    }
}

export function fetchLeaders(level, period) {
    return (dispatch, getState) => {
        const user = getState().auth.user;
        const getLeaders = firebase.firestore()
            .collection(`scores_${period}`)
            .where('difficulty', '==', level)
            .where('timestamp', '>=', periodStart[period]())
            .orderBy('timestamp')
            .orderBy('score')
            .limit(10)
            .get()
            .then((snapshots) => {
                let leaders = [],
                    idx = 0;

                snapshots.forEach(snapshot => {
                    leaders.push({
                        score: snapshot.data(),
                        rank: ++idx
                    });
                });

                return leaders;
            })
            .catch(err => {
                console.log(err);
                return [];
            });


        return Promise.all([getLeaders]).then(([leaders]) => {
            console.log(leaders);
            dispatch({
                type: UPDATE_LEADERS,
                payload: leaders
            });
            return leaders;
        });
    }
}

