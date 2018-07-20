/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import React from 'react';
import { NetInfo } from 'react-native';
import { StackNavigator } from 'react-navigation';
import { Provider } from 'react-redux';
import store from './modules/store';
import { restoreAuthentication } from './modules/auth';
import { restoreScore, submitOfflineScores } from './modules/score';
import MainScreen from './screens/main/MainScreen';
import GameScreen from './screens/game/GameScreen';
import LeaderboardScreen from './screens/leaderboard/LeaderboardScreen';
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue.js';

const RootStack = StackNavigator(
    {
        Main: {
            screen: MainScreen,
        },
        Game: {
            screen: GameScreen,
        },
        Leaderboard: {
            screen: LeaderboardScreen
        }
    },
    {
        initialRouteName: 'Main',
        navigationOptions: {
            header: null
        }
    }
);

bootstrap();

export default function App() {
    return <Provider store={store}><RootStack /></Provider>;
}

async function bootstrap() {
    if (await connectivityAvailable()) {
        await loginAndSyncGameData();
        syncAfterNetworkChange();
    }
    else {
        syncAfterNetworkChange();
    }
}

function connectivityAvailable() {
   return NetInfo.isConnected.fetch();
}

async function loginAndSyncGameData() {
    try {
        await login();
        await syncOfflineScore();
        await subscribeToScoreUpdates();
    }
    catch(err) {
        console.log(err)
    }    
}

function syncAfterNetworkChange() {
    NetInfo.addEventListener('connectionChange', async () => {
        if (await connectivityAvailable()) {
            if (getCurrentUser()) {
                syncOfflineScore();
            }
            else {
                loginAndSyncGameData();
            }
        }
    });
}

function getCurrentUser() {
    return store.getState().auth.user;
}

function login() {
    return store.dispatch(restoreAuthentication());
}

function subscribeToScoreUpdates() {
    return store.dispatch(restoreScore());
}

function syncOfflineScore() {
    return store.dispatch(submitOfflineScores());
}

const spyFunction = (msg) => {
    console.log(msg);
  };
  
  //MessageQueue.spy(spyFunction);