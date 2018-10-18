/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import React from 'react';
import { NetInfo, StatusBar, View } from 'react-native';
import { StackNavigator } from 'react-navigation';
import { Provider } from 'react-redux';
import Orientation from 'react-native-orientation-locker';
import store from './modules/store';
import { restoreAuthentication } from './modules/auth';
import { restoreScore, submitOfflineScores } from './modules/score';
import MainScreen from './screens/main/MainScreen';
import GameScreen from './screens/game/GameScreen';
import LeaderboardScreen from './screens/leaderboard/LeaderboardScreen';
import { connectivityAvailable } from './shared/connection';
import { BG_MAIN_COLOR } from './constants';
//import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue.js';

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
        },
        cardStyle: {
            backgroundColor: BG_MAIN_COLOR
        }
    }
);

bootstrap();

export default function App() {
    return <Provider store={store}>
        <View style={{flex: 1}}>
            <StatusBar
                backgroundColor={BG_MAIN_COLOR}
                barStyle="light-content"
            />
            <RootStack />
        </View>
    </Provider>;
}

async function bootstrap() {
    Orientation.lockToPortrait();
    if (await connectivityAvailable()) {
        await loginAndSyncGameData();
        syncAfterNetworkChange();
    }
    else {
        syncAfterNetworkChange();
    }
}

async function loginAndSyncGameData() {
    try {
        await login();
        await syncOfflineScore();
        await subscribeToScoreUpdates();
    }
    catch (err) {
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

/*const spyFunction = (msg) => {
    console.log(msg);
};

MessageQueue.spy(spyFunction);
*/