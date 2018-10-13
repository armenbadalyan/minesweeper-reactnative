import firebase from 'react-native-firebase';
import moment from 'moment';
import { DifficultyLevel } from './game';

// Actions

export const UPDATE_LEVEL = 'leaderboard/UPDATE_LEVEL';
export const UPDATE_PERIOD = 'leaderboard/UPDATE_PERIOD';
export const UPDATE_LEADERS = 'leaderboard/UPDATE_LEADERS';
export const UPDATE_PLAYER_RANK = 'leaderboard/UPDATE_PLAYER_RANK';

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
    playerRank: 0
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
        case UPDATE_PLAYER_RANK:
            return {
                ...state,
                playerRank: payload
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
        const state = getState(),
            user = state.auth.user,
            bestScore = state.score.bestScore;


        return firebase.firestore()
            .collection(`scores_${period}`)
            .where('difficulty', '==', level)
            .where('period', '==', periodStart[period]())
            .orderBy('score')
            .limit(TOP_RANK_COUNT)
            .get()
            .then((snapshots) => {
                let leaders = [],
                    idx = 0,
                    currentUserLeaderRank = 0;

                snapshots.forEach(snapshot => {
                    const userData = snapshot.data();

                    leaders.push({
                        score: userData,
                        rank: ++idx
                    });
                });

                if (leaders.length) {
                    currentUserLeaderRank = getCurrentUserLeaderRank(user, leaders);

                    if (!currentUserLeaderRank && bestScore && bestScore[level]) {
                        fetchCurrentUserGlobalRank(user, bestScore[level].score, level, period).then(userRank => {
                            dispatch({
                                type: UPDATE_PLAYER_RANK,
                                payload: userRank
                            })
                        }).catch(err => {
                            console.log(err);
                        });
                    }
                }                

                dispatch({
                    type: UPDATE_LEADERS,
                    payload: {
                        leaders,
                        playerRank: currentUserLeaderRank
                    }
                });

                return leaders;
            })
            .catch(err => {
                console.log(err);
                return [];
            });
    }
}

function fetchCurrentUserGlobalRank(user, userScore, level, period) {
    return firebase.firestore()
        .collection(`scores_${period}`)
        .where('difficulty', '==', level)
        .where('period', '==', periodStart[period]())
        .where('score', '<', userScore)
        .orderBy('score')
        .get()
        .then((snapshots) => {
            return snapshots.size + 1;
        });
}

function getCurrentUserLeaderRank(currentUser, leaders) {
    return leaders.findIndex(leader => leader.score.user.uid === currentUser.uid) + 1;
}

