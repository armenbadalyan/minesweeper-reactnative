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

const TOP_RANK_COUNT = 100;

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
                leaders: payload.leaders,
                playerRank: payload.playerRank
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
        const state = getState();
        const user = state.auth.user;
        const bestScore = state.score.bestScore;

        const getLeaders = firebase.firestore()
            .collection(`scores_${period}`)
            .where('difficulty', '==', level)
            .where('period', '==', periodStart[period]())
            .orderBy('score')
            .limit(TOP_RANK_COUNT)
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

        let leaderboardRequests = [getLeaders];

        if (user && bestScore && bestScore[level]) {
            const getPlayerRank = firebase.firestore()
                .collection(`scores_${period}`)
                .where('difficulty', '==', level)
                .where('period', '==', periodStart[period]())
                .where('score', '<', bestScore[level].score)
                .orderBy('score')
                .get()
                .then((snapshots) => {                    
                    return snapshots.size + 1;
                })
                .catch(err => {
                    return null;
                });

            leaderboardRequests.push(getPlayerRank);
        }


        return Promise.all(leaderboardRequests).then(([leaders, playerRank]) => {
            console.log(leaders);
            dispatch({
                type: UPDATE_LEADERS,
                payload: {
                    leaders,
                    playerRank
                }
            });
            return leaders;
        });
    }
}

